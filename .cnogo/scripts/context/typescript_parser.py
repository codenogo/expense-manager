"""Regex-based TypeScript/TSX parser for context graph ingestion.

Parses TypeScript and TSX source files using regular expressions to extract
symbols, imports, calls, heritage relationships, type references, and exports.

Constraint: stdlib-only — no external Python dependencies.
"""

from __future__ import annotations

import re

from scripts.context.parse_types import (
    CallInfo,
    ImportInfo,
    ParseResult,
    SymbolInfo,
    TypeRef,
)

# ---------------------------------------------------------------------------
# Pre-processor: strip comments and string literals to avoid false positives
# ---------------------------------------------------------------------------

# Order matters: template literals first (can contain ${} with quotes inside),
# then multi-line comments, then single-line comments, then strings.
_STRIP_RE = re.compile(
    r"""
      `(?:[^`\\]|\\.)*`           # template literals
    | /\*[\s\S]*?\*/              # multi-line comments
    | //[^\n]*                    # single-line comments
    | "(?:[^"\\]|\\.)*"           # double-quoted strings
    | '(?:[^'\\]|\\.)*'           # single-quoted strings
    """,
    re.VERBOSE,
)


_STRIP_COMMENTS_RE = re.compile(
    r"""
      /\*[\s\S]*?\*/              # multi-line comments
    | //[^\n]*                    # single-line comments
    """,
    re.VERBOSE,
)


def _strip_comments_only(source: str) -> str:
    """Remove comments but preserve string literals and other code."""
    def _replacer(m: re.Match[str]) -> str:
        return re.sub(r"[^\n]", " ", m.group(0))
    return _STRIP_COMMENTS_RE.sub(_replacer, source)


def _strip_noise(source: str) -> str:
    """Replace comments and string literals with whitespace-preserving placeholders.

    Preserves line count so line numbers remain accurate.
    """
    def _replacer(m: re.Match[str]) -> str:
        text = m.group(0)
        # Preserve newlines so line numbers stay correct
        return re.sub(r"[^\n]", " ", text)

    return _STRIP_RE.sub(_replacer, source)


# ---------------------------------------------------------------------------
# Symbol extraction
# ---------------------------------------------------------------------------

# export? (async)? function name(
_FUNC_DECL_RE = re.compile(
    r"^[ \t]*(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+(\w+)\s*\(",
    re.MULTILINE,
)

# export? const/let/var name = (...) => | = function
_ARROW_FN_RE = re.compile(
    r"^[ \t]*(?:export\s+(?:default\s+)?)?(?:const|let|var)\s+(\w+)"
    r"\s*(?::\s*[^=]+?)?\s*=\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z_]\w*)\s*(?::\s*\S+)?\s*=>",
    re.MULTILINE,
)

# Also catch: const name = function
_FUNC_EXPR_RE = re.compile(
    r"^[ \t]*(?:export\s+(?:default\s+)?)?(?:const|let|var)\s+(\w+)"
    r"\s*=\s*(?:async\s+)?function\b",
    re.MULTILINE,
)

# export? class Name
_CLASS_DECL_RE = re.compile(
    r"^[ \t]*(?:export\s+(?:default\s+)?)?(?:abstract\s+)?class\s+(\w+)",
    re.MULTILINE,
)

# export? interface Name
_INTERFACE_DECL_RE = re.compile(
    r"^[ \t]*(?:export\s+(?:default\s+)?)?interface\s+(\w+)",
    re.MULTILINE,
)

# export? type Name =
_TYPE_ALIAS_RE = re.compile(
    r"^[ \t]*(?:export\s+(?:default\s+)?)?type\s+(\w+)\s*(?:<[^>]*>)?\s*=",
    re.MULTILINE,
)

# export? (const)? enum Name
_ENUM_DECL_RE = re.compile(
    r"^[ \t]*(?:export\s+(?:default\s+)?)?(?:const\s+)?enum\s+(\w+)",
    re.MULTILINE,
)

# Class method: indented name( or async name( — after stripping, inside class body
_METHOD_RE = re.compile(
    r"^[ \t]+(?:(?:public|private|protected|static|readonly|abstract|override|async)\s+)*"
    r"(?:get\s+|set\s+)?(\w+)\s*(?:<[^>]*>)?\s*\(",
    re.MULTILINE,
)


# ---------------------------------------------------------------------------
# Import extraction
# ---------------------------------------------------------------------------

# import { A, B } from 'module'
_NAMED_IMPORT_RE = re.compile(
    r"""^[ \t]*import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]""",
    re.MULTILINE,
)

# import Foo from 'module'
_DEFAULT_IMPORT_RE = re.compile(
    r"""^[ \t]*import\s+(\w+)\s+from\s+['"]([^'"]+)['"]""",
    re.MULTILINE,
)

# import * as Foo from 'module'
_NAMESPACE_IMPORT_RE = re.compile(
    r"""^[ \t]*import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]""",
    re.MULTILINE,
)

# import 'module' (side-effect)
_SIDE_EFFECT_IMPORT_RE = re.compile(
    r"""^[ \t]*import\s+['"]([^'"]+)['"]""",
    re.MULTILINE,
)

# import Foo, { A, B } from 'module'
_MIXED_IMPORT_RE = re.compile(
    r"""^[ \t]*import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]""",
    re.MULTILINE,
)

# export { A, B } from 'module' (re-exports)
_REEXPORT_RE = re.compile(
    r"""^[ \t]*export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]""",
    re.MULTILINE,
)


# ---------------------------------------------------------------------------
# Call extraction
# ---------------------------------------------------------------------------

_CALL_RE = re.compile(
    r"(?:^|[^.\w])(?:(\w+)\.)?(\w+)\s*\(",
    re.MULTILINE,
)

_CALL_SKIP = frozenset({
    "if", "for", "while", "switch", "return", "new", "import", "export",
    "from", "catch", "typeof", "instanceof", "void", "delete", "throw",
    "case", "else", "in", "of", "await", "yield", "class", "function",
    "interface", "type", "enum", "const", "let", "var", "async",
    "constructor", "super", "extends", "implements",
})


# ---------------------------------------------------------------------------
# Heritage extraction
# ---------------------------------------------------------------------------

_EXTENDS_RE = re.compile(
    r"(?:class|interface)\s+(\w+)(?:\s*<[^>]*>)?\s+extends\s+([\w.,\s<>]+?)(?:\s*\{|\s+implements)",
    re.MULTILINE,
)

_IMPLEMENTS_RE = re.compile(
    r"class\s+(\w+)(?:\s*<[^>]*>)?(?:\s+extends\s+\w+(?:\s*<[^>]*>)?)?\s+implements\s+([\w.,\s<>]+?)\s*\{",
    re.MULTILINE,
)


# ---------------------------------------------------------------------------
# Export extraction
# ---------------------------------------------------------------------------

_EXPORT_DECL_RE = re.compile(
    r"^[ \t]*export\s+(?:default\s+)?(?:async\s+)?(?:function|class|interface|type|enum|const|let|var|abstract\s+class)\s+(\w+)",
    re.MULTILINE,
)

_EXPORT_LIST_RE = re.compile(
    r"^[ \t]*export\s+\{([^}]+)\}\s*;",
    re.MULTILINE,
)

_EXPORT_DEFAULT_IDENT_RE = re.compile(
    r"^[ \t]*export\s+default\s+(\w+)\s*;",
    re.MULTILINE,
)


# ---------------------------------------------------------------------------
# Type reference extraction (from function signatures)
# ---------------------------------------------------------------------------

_FUNC_SIG_RE = re.compile(
    r"(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:function)?)\s*"
    r"(?:<[^>]*>)?\s*\(([^)]*)\)(?:\s*:\s*([^\n{=]+))?",
    re.MULTILINE,
)

_PARAM_TYPE_RE = re.compile(
    r":\s*([\w.<>,\s|&\[\]]+?)(?:\s*[,)=]|$)",
)

_TYPE_NAME_RE = re.compile(r"\b([A-Z]\w+)\b")


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

def _find_end_line(source: str, start_pos: int) -> int:
    """Estimate end line by finding the matching closing brace."""
    depth = 0
    in_line = source[:start_pos].count("\n") + 1
    found_open = False
    for i in range(start_pos, len(source)):
        ch = source[i]
        if ch == "{":
            depth += 1
            found_open = True
        elif ch == "}":
            depth -= 1
            if found_open and depth == 0:
                return source[:i].count("\n") + 1
        elif ch == "\n" and not found_open:
            # Single-line declaration (e.g., type alias)
            if depth == 0:
                return in_line
    return in_line


def _line_at(source: str, pos: int) -> int:
    """Return 1-based line number for a character position."""
    return source[:pos].count("\n") + 1


def _extract_class_methods(
    source: str, class_name: str, class_start: int, class_end_line: int,
) -> list[SymbolInfo]:
    """Extract methods from a class body."""
    methods: list[SymbolInfo] = []
    # Find the class body (between first { and matching })
    brace_pos = source.find("{", class_start)
    if brace_pos == -1:
        return methods

    depth = 1
    body_start = brace_pos + 1
    body_end = len(source)
    for i in range(body_start, len(source)):
        if source[i] == "{":
            depth += 1
        elif source[i] == "}":
            depth -= 1
            if depth == 0:
                body_end = i
                break

    body = source[body_start:body_end]
    body_line_offset = _line_at(source, body_start) - 1

    for m in _METHOD_RE.finditer(body):
        name = m.group(1)
        # Skip constructor-like keywords and known non-method patterns
        if name in ("constructor", "if", "for", "while", "switch", "return",
                     "new", "catch", "class", "function", "import", "export"):
            if name != "constructor":
                continue
        line = body[:m.start()].count("\n") + 1 + body_line_offset
        methods.append(SymbolInfo(
            name=name,
            kind="method",
            start_line=line,
            end_line=line,  # approximate
            class_name=class_name,
        ))

    return methods


class TypeScriptParser:
    """Parses TypeScript/TSX source to extract symbols, imports, calls, heritage, types."""

    @staticmethod
    def parse(source: str, file_path: str) -> ParseResult:
        """Parse TypeScript/TSX source code and extract all information.

        Args:
            source: TypeScript/TSX source code string.
            file_path: Path to the source file (for metadata).

        Returns:
            ParseResult with extracted symbols, imports, calls, etc.
        """
        result = ParseResult(file_path=file_path)

        if not source.strip():
            return result

        # Strip comments and strings for pattern matching (avoids false positives)
        cleaned = _strip_noise(source)

        # Strip only comments (preserve strings) for import extraction,
        # since import regexes need the module path strings intact
        comments_only = _strip_comments_only(source)

        _extract_symbols(source, cleaned, result)
        _extract_imports(comments_only, result)
        _extract_calls(cleaned, result)
        _extract_heritage(cleaned, result)
        _extract_type_refs(cleaned, result)
        _extract_exports(cleaned, result)

        return result


def _extract_symbols(
    original: str, cleaned: str, result: ParseResult,
) -> None:
    """Extract function, class, method, interface, type alias, and enum symbols."""
    # Track class ranges to extract methods
    class_ranges: list[tuple[str, int, int, int]] = []  # (name, match_pos, start_line, end_line)

    # Functions
    for m in _FUNC_DECL_RE.finditer(cleaned):
        name = m.group(1)
        line = _line_at(cleaned, m.start())
        end_line = _find_end_line(cleaned, m.start())
        result.symbols.append(SymbolInfo(
            name=name, kind="function",
            start_line=line, end_line=end_line,
        ))

    # Arrow functions
    seen_arrows: set[str] = set()
    for m in _ARROW_FN_RE.finditer(cleaned):
        name = m.group(1)
        if name in seen_arrows:
            continue
        seen_arrows.add(name)
        line = _line_at(cleaned, m.start())
        result.symbols.append(SymbolInfo(
            name=name, kind="function",
            start_line=line, end_line=line,
        ))

    # Function expressions (const name = function)
    for m in _FUNC_EXPR_RE.finditer(cleaned):
        name = m.group(1)
        if name in seen_arrows:
            continue
        line = _line_at(cleaned, m.start())
        end_line = _find_end_line(cleaned, m.start())
        result.symbols.append(SymbolInfo(
            name=name, kind="function",
            start_line=line, end_line=end_line,
        ))

    # Classes
    for m in _CLASS_DECL_RE.finditer(cleaned):
        name = m.group(1)
        line = _line_at(cleaned, m.start())
        end_line = _find_end_line(cleaned, m.start())
        result.symbols.append(SymbolInfo(
            name=name, kind="class",
            start_line=line, end_line=end_line,
        ))
        class_ranges.append((name, m.start(), line, end_line))

    # Class methods
    for class_name, match_pos, start_line, end_line in class_ranges:
        methods = _extract_class_methods(original, class_name, match_pos, end_line)
        result.symbols.extend(methods)

    # Interfaces
    for m in _INTERFACE_DECL_RE.finditer(cleaned):
        name = m.group(1)
        line = _line_at(cleaned, m.start())
        end_line = _find_end_line(cleaned, m.start())
        result.symbols.append(SymbolInfo(
            name=name, kind="interface",
            start_line=line, end_line=end_line,
        ))

    # Type aliases
    for m in _TYPE_ALIAS_RE.finditer(cleaned):
        name = m.group(1)
        line = _line_at(cleaned, m.start())
        result.symbols.append(SymbolInfo(
            name=name, kind="type_alias",
            start_line=line, end_line=line,
        ))

    # Enums
    for m in _ENUM_DECL_RE.finditer(cleaned):
        name = m.group(1)
        line = _line_at(cleaned, m.start())
        end_line = _find_end_line(cleaned, m.start())
        result.symbols.append(SymbolInfo(
            name=name, kind="enum",
            start_line=line, end_line=end_line,
        ))


def _extract_imports(cleaned: str, result: ParseResult) -> None:
    """Extract ES module import statements."""
    # Mixed imports: import Foo, { A, B } from 'module'
    mixed_positions: set[int] = set()
    for m in _MIXED_IMPORT_RE.finditer(cleaned):
        default_name = m.group(1)
        named_raw = m.group(2)
        module = m.group(3)
        mixed_positions.add(m.start())
        names = [n.strip().split(" as ")[0].strip()
                 for n in named_raw.split(",") if n.strip()]
        names.insert(0, default_name)
        is_relative = module.startswith(".")
        result.imports.append(ImportInfo(
            module=module,
            names=names,
            is_relative=is_relative,
        ))

    # Named imports: import { A, B } from 'module'
    for m in _NAMED_IMPORT_RE.finditer(cleaned):
        if m.start() in mixed_positions:
            continue
        raw_names = m.group(1)
        module = m.group(2)
        names = [n.strip().split(" as ")[0].strip()
                 for n in raw_names.split(",") if n.strip()]
        is_relative = module.startswith(".")
        result.imports.append(ImportInfo(
            module=module,
            names=names,
            is_relative=is_relative,
        ))

    # Namespace imports: import * as Foo from 'module'
    for m in _NAMESPACE_IMPORT_RE.finditer(cleaned):
        name = m.group(1)
        module = m.group(2)
        is_relative = module.startswith(".")
        result.imports.append(ImportInfo(
            module=module,
            names=[name],
            is_relative=is_relative,
        ))

    # Default imports: import Foo from 'module'
    # Must come after named/namespace to avoid matching their prefixes
    named_starts = {m.start() for m in _NAMED_IMPORT_RE.finditer(cleaned)}
    ns_starts = {m.start() for m in _NAMESPACE_IMPORT_RE.finditer(cleaned)}
    for m in _DEFAULT_IMPORT_RE.finditer(cleaned):
        if m.start() in named_starts or m.start() in ns_starts or m.start() in mixed_positions:
            continue
        name = m.group(1)
        # Skip 'import type' — it's a TS type-only import modifier
        if name == "type":
            continue
        module = m.group(2)
        is_relative = module.startswith(".")
        result.imports.append(ImportInfo(
            module=module,
            names=[name],
            is_relative=is_relative,
        ))

    # Side-effect imports: import 'module'
    all_import_starts = (
        mixed_positions | named_starts | ns_starts
        | {m.start() for m in _DEFAULT_IMPORT_RE.finditer(cleaned)}
    )
    for m in _SIDE_EFFECT_IMPORT_RE.finditer(cleaned):
        if m.start() in all_import_starts:
            continue
        module = m.group(1)
        is_relative = module.startswith(".")
        result.imports.append(ImportInfo(
            module=module,
            names=[],
            is_relative=is_relative,
        ))

    # Re-exports: export { A, B } from 'module'
    for m in _REEXPORT_RE.finditer(cleaned):
        raw_names = m.group(1)
        module = m.group(2)
        names = [n.strip().split(" as ")[0].strip()
                 for n in raw_names.split(",") if n.strip()]
        is_relative = module.startswith(".")
        result.imports.append(ImportInfo(
            module=module,
            names=names,
            is_relative=is_relative,
        ))


def _extract_calls(cleaned: str, result: ParseResult) -> None:
    """Extract function and method calls."""
    for m in _CALL_RE.finditer(cleaned):
        receiver = m.group(1) or ""
        name = m.group(2)
        if name in _CALL_SKIP:
            continue
        line = _line_at(cleaned, m.start())
        result.calls.append(CallInfo(
            name=name,
            line=line,
            receiver=receiver,
        ))


def _extract_heritage(cleaned: str, result: ParseResult) -> None:
    """Extract extends and implements relationships."""
    for m in _EXTENDS_RE.finditer(cleaned):
        child = m.group(1)
        parents_raw = m.group(2)
        for parent in parents_raw.split(","):
            parent = parent.strip()
            # Strip generic params
            parent = re.sub(r"<.*>", "", parent).strip()
            if parent:
                result.heritage.append((child, "extends", parent))

    for m in _IMPLEMENTS_RE.finditer(cleaned):
        child = m.group(1)
        ifaces_raw = m.group(2)
        for iface in ifaces_raw.split(","):
            iface = iface.strip()
            iface = re.sub(r"<.*>", "", iface).strip()
            if iface:
                result.heritage.append((child, "implements", iface))


def _extract_type_refs(cleaned: str, result: ParseResult) -> None:
    """Extract type references from function parameter and return type annotations."""
    for m in _FUNC_SIG_RE.finditer(cleaned):
        params_str = m.group(1)
        return_type = m.group(2)
        line = _line_at(cleaned, m.start())

        # Parameter types
        if params_str:
            for pm in _PARAM_TYPE_RE.finditer(params_str):
                type_str = pm.group(1).strip()
                for tm in _TYPE_NAME_RE.finditer(type_str):
                    result.type_refs.append(TypeRef(
                        name=tm.group(1), kind="param", line=line,
                    ))

        # Return type
        if return_type:
            return_type = return_type.strip().rstrip("{").strip()
            for tm in _TYPE_NAME_RE.finditer(return_type):
                result.type_refs.append(TypeRef(
                    name=tm.group(1), kind="return", line=line,
                ))


def _extract_exports(cleaned: str, result: ParseResult) -> None:
    """Extract exported symbol names."""
    # export function/class/interface/type/enum/const name
    for m in _EXPORT_DECL_RE.finditer(cleaned):
        result.exports.append(m.group(1))

    # export { A, B }
    for m in _EXPORT_LIST_RE.finditer(cleaned):
        raw = m.group(1)
        for name in raw.split(","):
            name = name.strip()
            if " as " in name:
                name = name.split(" as ")[-1].strip()
            if name:
                result.exports.append(name)

    # export default identifier;
    for m in _EXPORT_DEFAULT_IDENT_RE.finditer(cleaned):
        name = m.group(1)
        if name not in ("function", "class", "interface", "type", "enum"):
            result.exports.append(name)

    # Re-exports count as exports too
    for m in _REEXPORT_RE.finditer(cleaned):
        raw = m.group(1)
        for name in raw.split(","):
            name = name.strip()
            if " as " in name:
                name = name.split(" as ")[-1].strip()
            if name:
                result.exports.append(name)
