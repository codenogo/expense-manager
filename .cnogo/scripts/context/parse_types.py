"""Shared parse result dataclasses for context graph parsers.

Language-agnostic data structures used by both the Python AST parser
and the TypeScript regex parser.

Zero external dependencies — stdlib only.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class SymbolInfo:
    """A symbol (function, class, method, interface, etc.) extracted from source."""

    name: str
    kind: str  # "function", "class", "method", "interface", "type_alias", "enum"
    start_line: int
    end_line: int
    signature: str = ""
    class_name: str = ""
    decorators: list[str] = field(default_factory=list)
    docstring: str = ""


@dataclass
class ImportInfo:
    """An import statement extracted from source."""

    module: str
    names: list[str] = field(default_factory=list)
    is_relative: bool = False
    level: int = 0


@dataclass
class CallInfo:
    """A function/method call extracted from source."""

    name: str
    line: int
    receiver: str = ""


@dataclass
class TypeRef:
    """A type reference extracted from annotations."""

    name: str
    kind: str  # "param", "return"
    line: int


@dataclass
class ParseResult:
    """Complete parse result for a single file."""

    file_path: str
    symbols: list[SymbolInfo] = field(default_factory=list)
    imports: list[ImportInfo] = field(default_factory=list)
    calls: list[CallInfo] = field(default_factory=list)
    heritage: list[tuple[str, str, str]] = field(default_factory=list)
    type_refs: list[TypeRef] = field(default_factory=list)
    exports: list[str] = field(default_factory=list)
