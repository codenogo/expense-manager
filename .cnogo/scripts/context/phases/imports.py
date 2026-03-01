"""Import resolution phase.

Builds a file index mapping dotted module paths to FILE node IDs,
resolves imports to target files, and creates IMPORTS edges.

Supports both Python (dotted module paths) and TypeScript/JavaScript
(ES module specifiers with path alias and extension resolution).

Zero external dependencies — stdlib only.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path, PurePosixPath

from scripts.context.model import (
    GraphRelationship,
    NodeLabel,
    RelType,
    generate_id,
)
from scripts.context.python_parser import ImportInfo, ParseResult
from scripts.context.storage import GraphStorage

# Standard library module names to skip (top-level only)
_STDLIB_MODULES = frozenset(sys.stdlib_module_names) if hasattr(sys, 'stdlib_module_names') else frozenset({
    "os", "sys", "re", "json", "math", "collections", "itertools", "functools",
    "pathlib", "typing", "dataclasses", "enum", "abc", "io", "copy", "hashlib",
    "sqlite3", "ast", "inspect", "textwrap", "argparse", "logging", "unittest",
    "tempfile", "shutil", "fnmatch", "glob", "contextlib", "importlib",
    "subprocess", "threading", "multiprocessing", "socket", "http", "urllib",
    "email", "html", "xml", "csv", "configparser", "struct", "codecs",
    "datetime", "time", "calendar", "random", "secrets", "string", "operator",
    "bisect", "heapq", "weakref", "types", "traceback", "warnings", "pdb",
    "profile", "pstats", "timeit", "dis", "pickle", "shelve", "marshal",
    "dbm", "gzip", "bz2", "lzma", "zipfile", "tarfile", "stat", "fileinput",
    "signal", "mmap", "ctypes", "platform", "sysconfig", "builtins",
    "__future__", "array", "queue", "select", "selectors", "asyncio",
    "concurrent", "venv", "ensurepip", "pip", "setuptools",
})


_TS_JS_EXTENSIONS = frozenset({".ts", ".tsx", ".js", ".jsx"})
_INDEX_FILES = frozenset({"index.ts", "index.tsx", "index.js", "index.jsx"})


def build_file_index(storage: GraphStorage) -> dict[str, str]:
    """Build mapping from module paths to FILE node IDs.

    Python:
      'scripts/memory/__init__.py' → 'scripts.memory'
      'scripts/memory/bridge.py'   → 'scripts.memory.bridge'

    TypeScript/JavaScript:
      'src/lib/utils.ts'           → 'src/lib/utils' (path-based key)
      'src/lib/index.ts'           → 'src/lib'       (directory index)
    """
    assert storage._conn is not None
    cur = storage._conn.execute(
        "SELECT id, file_path FROM nodes WHERE label = ?",
        (NodeLabel.FILE.value,),
    )

    index: dict[str, str] = {}
    for node_id, file_path in cur.fetchall():
        path = PurePosixPath(file_path)

        if path.suffix == ".py":
            # Python module indexing
            if path.name == "__init__.py":
                module_path = ".".join(path.parent.parts)
                if module_path:
                    index[module_path] = node_id
            else:
                stem_parts = list(path.parent.parts) + [path.stem]
                module_path = ".".join(stem_parts)
                if module_path:
                    index[module_path] = node_id

        elif path.suffix in _TS_JS_EXTENSIONS:
            # TS/JS module indexing: store path-based keys (no extension)
            # e.g., "src/lib/utils.ts" → "src/lib/utils"
            path_key = str(path.with_suffix(""))
            index[path_key] = node_id
            # Also store with extension for exact matches
            index[str(path)] = node_id

            # Index files map to parent directory
            if path.name in _INDEX_FILES:
                parent_key = str(path.parent)
                if parent_key and parent_key != ".":
                    index[parent_key] = node_id

    return index


def _is_stdlib(module: str) -> bool:
    """Check if a module name is a stdlib module."""
    top_level = module.split(".")[0]
    return top_level in _STDLIB_MODULES


def resolve_import(
    imp: ImportInfo,
    source_file: str,
    file_index: dict[str, str],
) -> str | None:
    """Resolve an import to a FILE node ID.

    Returns the node ID of the target file, or None if unresolvable.
    """
    if imp.is_relative:
        return _resolve_relative(imp, source_file, file_index)
    else:
        return _resolve_absolute(imp, file_index)


def _resolve_absolute(imp: ImportInfo, file_index: dict[str, str]) -> str | None:
    """Resolve an absolute import."""
    module = imp.module
    if not module:
        return None

    if _is_stdlib(module):
        return None

    # Try exact module path
    if module in file_index:
        return file_index[module]

    # For 'from X import Y', X might be a package and Y a submodule
    # Try module.name for each imported name
    for name in imp.names:
        sub_module = f"{module}.{name}"
        if sub_module in file_index:
            return file_index[sub_module]

    return None


def _resolve_relative(
    imp: ImportInfo,
    source_file: str,
    file_index: dict[str, str],
) -> str | None:
    """Resolve a relative import via dot-counting from source directory."""
    source_path = PurePosixPath(source_file)
    # Go up `level` directories from the source file's directory
    base = source_path.parent
    for _ in range(imp.level - 1):
        base = base.parent

    # Build the target module path
    base_dotted = ".".join(base.parts) if base.parts else ""

    if imp.module:
        # from ..utils import helper → resolve 'utils' relative to base
        target = f"{base_dotted}.{imp.module}" if base_dotted else imp.module
    else:
        # from . import sibling → resolve each name relative to base
        for name in imp.names:
            target = f"{base_dotted}.{name}" if base_dotted else name
            if target in file_index:
                return file_index[target]
        return None

    if target in file_index:
        return file_index[target]

    return None


def _is_npm_package(module: str) -> bool:
    """Check if an import specifier is an npm/external package (not local).

    Bare specifiers like 'react', 'next/link', '@supabase/supabase-js'
    are external. Local imports start with './', '../', '@/', or '~/'.
    """
    if module.startswith(("./", "../", "@/", "~/")):
        return False
    return True


def _load_ts_path_aliases(storage: GraphStorage) -> dict[str, str]:
    """Load path aliases from tsconfig.json if available.

    Returns a mapping like {"@/*": "src/*"} → {"@/": "src/"}.
    Falls back to {"@/": "src/"} if tsconfig is not found.
    """
    aliases: dict[str, str] = {"@/": "src/"}

    # Try to find tsconfig.json relative to graph DB location
    if storage._db_path is not None:
        repo_root = Path(storage._db_path).parent.parent  # .cnogo/graph.db → repo root
        tsconfig_path = repo_root / "tsconfig.json"
        if tsconfig_path.exists():
            try:
                raw = tsconfig_path.read_text(encoding="utf-8")
                config = json.loads(raw)
                paths = config.get("compilerOptions", {}).get("paths", {})
                base_url = config.get("compilerOptions", {}).get("baseUrl", ".")
                for alias, targets in paths.items():
                    if targets and isinstance(targets, list):
                        # "@/*" → ["./src/*"]
                        alias_prefix = alias.replace("*", "")
                        target_prefix = targets[0].replace("*", "").lstrip("./")
                        if base_url != ".":
                            target_prefix = f"{base_url}/{target_prefix}".replace("//", "/")
                        aliases[alias_prefix] = target_prefix
            except (json.JSONDecodeError, OSError, KeyError):
                pass

    return aliases


def _resolve_ts_import(
    module: str,
    source_file: str,
    file_index: dict[str, str],
    path_aliases: dict[str, str],
) -> str | None:
    """Resolve a TypeScript/JavaScript import specifier to a FILE node ID.

    Handles:
    - Path aliases: @/lib/utils → src/lib/utils
    - Relative imports: ./foo → try foo.ts, foo.tsx, foo/index.ts, etc.
    - Extension-less imports: try .ts, .tsx, .js, .jsx suffixes
    """
    # Skip npm packages
    if _is_npm_package(module):
        return None

    # Resolve path alias
    resolved = module
    for alias, target in path_aliases.items():
        if module.startswith(alias):
            resolved = target + module[len(alias):]
            break

    # Resolve relative imports
    if resolved.startswith(("./", "../")):
        source_dir = str(PurePosixPath(source_file).parent)
        parts = resolved.split("/")
        base_parts = source_dir.split("/") if source_dir and source_dir != "." else []
        for part in parts:
            if part == ".":
                continue
            elif part == "..":
                if base_parts:
                    base_parts.pop()
            else:
                base_parts.append(part)
        resolved = "/".join(base_parts)

    # Try exact match first
    if resolved in file_index:
        return file_index[resolved]

    # Try with extensions
    for ext in (".ts", ".tsx", ".js", ".jsx"):
        candidate = resolved + ext
        if candidate in file_index:
            return file_index[candidate]

    # Try as directory with index file
    for idx in ("index.ts", "index.tsx", "index.js", "index.jsx"):
        candidate = f"{resolved}/{idx}"
        if candidate in file_index:
            return file_index[candidate]

    return None


def _is_ts_js_file(file_path: str) -> bool:
    """Check if a file path is a TypeScript or JavaScript file."""
    return PurePosixPath(file_path).suffix in _TS_JS_EXTENSIONS


def process_imports(
    parse_results: dict[str, ParseResult],
    storage: GraphStorage,
) -> None:
    """Create IMPORTS edges from parse results.

    Routes to Python or TypeScript import resolution based on source file type.

    Args:
        parse_results: Mapping of file_path → ParseResult.
        storage: GraphStorage to write relationships to.
    """
    file_index = build_file_index(storage)
    relationships: list[GraphRelationship] = []

    # Lazily load TS path aliases only if we have TS/JS files
    ts_aliases: dict[str, str] | None = None

    for file_path, result in parse_results.items():
        source_id = generate_id(NodeLabel.FILE, file_path, "")
        is_ts_js = _is_ts_js_file(file_path)

        for imp in result.imports:
            if is_ts_js:
                if ts_aliases is None:
                    ts_aliases = _load_ts_path_aliases(storage)
                target_id = _resolve_ts_import(
                    imp.module, file_path, file_index, ts_aliases,
                )
            else:
                target_id = resolve_import(imp, file_path, file_index)

            if target_id is None:
                continue

            rel_id = f"imports:{source_id}->{target_id}"
            relationships.append(GraphRelationship(
                id=rel_id,
                type=RelType.IMPORTS,
                source=source_id,
                target=target_id,
                properties={"symbols": imp.names} if imp.names else {},
            ))

    if relationships:
        storage.add_relationships(relationships)
