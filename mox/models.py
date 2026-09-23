from dataclasses import dataclass, field, asdict


@dataclass
class Finding:
    plane: str
    algorithm: str
    file: str
    line: int = 0
    key_size: int | None = None
    mode: str | None = None
    curve: str | None = None
    evidence: str = ""
    fingerprint: str | None = None
    confidence: str = "medium"  # high | medium | low
    detector: str = ""
    meta: dict = field(default_factory=dict)

    def __post_init__(self):
        self.evidence = " ".join(self.evidence.split())[:120]

    def dedupe_key(self):
        return (self.file, self.line, self.algorithm, self.fingerprint or "")

    def to_dict(self):
        return asdict(self)
