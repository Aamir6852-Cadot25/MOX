/**
 * MOX Deterministic Demo Scan Fixture
 * Real data generated directly from demo_target and the mox detection engine.
 */

export const DEMO_SCAN_ID = 19;

export const DEMO_SCAN_SUMMARY = {
  "scan": {
    "id": 19,
    "target": "demo_target",
    "started_at": "2026-09-28T15:58:25+00:00",
    "seconds": 0.187,
    "files_scanned": 23,
    "findings_count": 35,
    "planes": {
      "containers": 2,
      "dependencies": 5,
      "code": 9,
      "certificates": 6,
      "configs": 10,
      "binaries": 3
    },
    "net": {
      "guard": true,
      "outbound": 0,
      "loopback": 0
    },
    "project_id": 5,
    "project_name": "demo_target"
  },
  "coverage": {
    "ran": [
      "code",
      "dependencies",
      "configs",
      "certificates",
      "containers",
      "binaries"
    ],
    "off": [
      "tls"
    ],
    "delta": null,
    "warning": null
  },
  "kpi": {
    "files": 23,
    "planes": 6,
    "seconds": 0.187,
    "assets": 26,
    "hndl": 1,
    "quantum_vulnerable": 10,
    "forgery": 2,
    "undetermined": 2,
    "readiness": 73,
    "safe": 16,
    "hybrid": 1
  },
  "by_type": {
    "algorithms": 15,
    "keys": 1,
    "certificates": 3,
    "protocols": 0,
    "libraries": 7
  },
  "verdicts": {
    "MIGRATE": 15,
    "CONTAIN": 4,
    "ACCEPT": 7
  },
  "verdict_detail": {
    "wave1": 5,
    "most_urgent": {
      "id": 255,
      "label": "RSA-2048 api-gw.key",
      "tier": "Critical",
      "score": 75.6,
      "why": "disallowed today under NIST SP 800-131A Rev.2: it is already classically broken, so it is wave 1"
    },
    "migrate": {
      "wave1": 5,
      "auto_fix": 5
    },
    "contain": [
      [
        "compiled into a binary",
        3
      ],
      [
        "firmware / HSM / KMS",
        1
      ]
    ],
    "accept": {
      "unverified": 6
    }
  },
  "stages": [
    {
      "stage": "Ingest",
      "count": 23,
      "detail": {
        "files": 23,
        "planes": {
          "containers": 2,
          "dependencies": 3,
          "code": 6,
          "certificates": 6,
          "configs": 4,
          "binaries": 1
        }
      },
      "ms": 5.528,
      "t_ms": 5.528
    },
    {
      "stage": "Detect",
      "count": 35,
      "detail": {
        "code": {
          "files": 6,
          "findings": 9,
          "ms": 25.981,
          "status": "ok",
          "errors": 0,
          "error": null
        },
        "dependencies": {
          "files": 3,
          "findings": 5,
          "ms": 5.048,
          "status": "ok",
          "errors": 0,
          "error": null
        },
        "configs": {
          "files": 4,
          "findings": 10,
          "ms": 8.335,
          "status": "ok",
          "errors": 0,
          "error": null
        },
        "certificates": {
          "files": 6,
          "findings": 6,
          "ms": 116.358,
          "status": "ok",
          "errors": 0,
          "error": null
        },
        "containers": {
          "files": 2,
          "findings": 2,
          "ms": 19.642,
          "status": "ok",
          "errors": 0,
          "error": null
        },
        "binaries": {
          "files": 1,
          "findings": 3,
          "ms": 1.647,
          "status": "ok",
          "errors": 0,
          "error": null
        },
        "tls": {
          "files": 0,
          "findings": 0,
          "ms": 0,
          "status": "off",
          "errors": 0,
          "error": null
        }
      },
      "ms": 181.027,
      "t_ms": 186.555
    },
    {
      "stage": "Correlate",
      "count": 25,
      "detail": {
        "findings": 35,
        "assets": 25
      },
      "ms": 5.695,
      "t_ms": 200.771
    },
    {
      "stage": "Score",
      "count": 25,
      "detail": {
        "Critical": 3,
        "High": 2,
        "Medium": 10,
        "Low": 10
      },
      "ms": 2.722,
      "t_ms": 203.493
    },
    {
      "stage": "Verdict",
      "count": 25,
      "detail": {
        "MIGRATE": 14,
        "CONTAIN": 4,
        "ACCEPT": 7
      },
      "ms": 0.442,
      "t_ms": 203.934
    }
  ],
  "field": [
    {
      "id": 255,
      "label": "RSA-2048 api-gw.key",
      "exposure": 9,
      "criticality": 3,
      "tier": "Critical",
      "score": 75.6
    },
    {
      "id": 258,
      "label": "RSA-1024 legacy-portal.crt",
      "exposure": -4,
      "criticality": 3,
      "tier": "Critical",
      "score": 75.6
    },
    {
      "id": 267,
      "label": "DES conf/java.security:3",
      "exposure": -4,
      "criticality": 3,
      "tier": "High",
      "score": 52.0
    },
    {
      "id": 268,
      "label": "3DES conf/java.security:3",
      "exposure": -4,
      "criticality": 3,
      "tier": "High",
      "score": 52.0
    },
    {
      "id": 273,
      "label": "DES payments/Crypto.java:16",
      "exposure": 7,
      "criticality": 3,
      "tier": "Critical",
      "score": 52.0
    },
    {
      "id": 265,
      "label": "MD5 auth/passwords.py:5",
      "exposure": 7,
      "criticality": 3,
      "tier": "Medium",
      "score": 36.7
    },
    {
      "id": 269,
      "label": "RC4 conf/java.security:3",
      "exposure": -4,
      "criticality": 3,
      "tier": "Medium",
      "score": 36.7
    },
    {
      "id": 271,
      "label": "SHA-1 payments/Crypto.java:6",
      "exposure": 7,
      "criticality": 3,
      "tier": "Medium",
      "score": 36.7
    },
    {
      "id": 275,
      "label": "AES utils/legacy_aes.py:5",
      "exposure": -3,
      "criticality": 3,
      "tier": "Medium",
      "score": 36.7
    },
    {
      "id": 279,
      "label": "MD5 web/sign.js:4",
      "exposure": -3,
      "criticality": 3,
      "tier": "Medium",
      "score": 36.7
    },
    {
      "id": 266,
      "label": "RSA auth/token_signer.py:10",
      "exposure": 7,
      "criticality": 3,
      "tier": "Medium",
      "score": 34.7
    },
    {
      "id": 280,
      "label": "RSA web/sign.js:8",
      "exposure": -3,
      "criticality": 3,
      "tier": "Medium",
      "score": 34.7
    },
    {
      "id": 256,
      "label": "ECDSA-256 ecdsa-p256.crt",
      "exposure": -3,
      "criticality": 3,
      "tier": "Medium",
      "score": 33.6
    },
    {
      "id": 257,
      "label": "RSA-4096 internal-ca.crt",
      "exposure": -4,
      "criticality": 3,
      "tier": "Medium",
      "score": 33.6
    },
    {
      "id": 278,
      "label": "MD5 vendor/sync-agent.bin:0",
      "exposure": 0,
      "criticality": 3,
      "tier": "Medium",
      "score": 26.9
    },
    {
      "id": 277,
      "label": "RSA vendor/sync-agent.bin:0",
      "exposure": 0,
      "criticality": 3,
      "tier": "Medium",
      "score": 25.2
    },
    {
      "id": 270,
      "label": "RSA-2048 infra/kms.tf:4",
      "exposure": 0,
      "criticality": 3,
      "tier": "Low",
      "score": 24.5
    },
    {
      "id": 272,
      "label": "RSA-2048 payments/Crypto.java:11",
      "exposure": 7,
      "criticality": 3,
      "tier": "Low",
      "score": 24.5
    },
    {
      "id": 274,
      "label": "ECDSA-256 services/ecdsa.go:10",
      "exposure": -3,
      "criticality": 3,
      "tier": "Low",
      "score": 24.5
    }
  ],
  "unplotted": 7
};

export const DEMO_ASSETS = [
  {
    "key": "0265202a2e67734d2a2bc3e66c05f9138a6b524eb536c2feaaa62a8a76d7b6ae",
    "fingerprint": "0265202a2e67734d2a2bc3e66c05f9138a6b524eb536c2feaaa62a8a76d7b6ae",
    "label": "RSA-2048 api-gw.key",
    "algorithm": "RSA",
    "key_size": 2048,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "8 findings \u2192 1 asset",
    "score": 75.6,
    "tier": "Critical",
    "priority_override": null,
    "owner": "",
    "status": "Open",
    "notes": "",
    "edited": true,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 40,
          "basis": "disallowed",
          "citation": [
            "NIST SP 800-52 Rev.2 (TLS guidelines)"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 15,
          "basis": "shor",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 8,
          "basis": "observed"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 63
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 1.0,
          "basis": "high"
        }
      ],
      "exact": 75.6,
      "base_status": "disallowed",
      "quantum": "shor",
      "quantum_vulnerable": true,
      "evidence": "observed",
      "evidence_label": "Observed",
      "confidence": "high",
      "criticality": 3,
      "threats": [
        "hndl",
        "forgery",
        "classical"
      ],
      "purposes": [
        {
          "file": "certs/api-gw.crt",
          "line": 1,
          "purpose": "sign",
          "evidence": "an X.509 certificate key signs; key transport through it is recorded as a separate cipher finding"
        },
        {
          "file": "certs/api-gw.key",
          "line": 1,
          "purpose": "sign",
          "evidence": "an X.509 certificate key signs; key transport through it is recorded as a separate cipher finding"
        },
        {
          "file": "image/app-image.tar!/app/certs/api-gw.crt",
          "line": 1,
          "purpose": "undetermined",
          "evidence": "no usage declared at this location (key generation, a string match, or a bare key spec)"
        },
        {
          "file": "keystore/app.p12",
          "line": 0,
          "purpose": "sign",
          "evidence": "an X.509 certificate key signs; key transport through it is recorded as a separate cipher finding"
        }
      ],
      "mosca": {
        "applies": true,
        "x": 15,
        "x_basis": "set by an analyst",
        "y": 4,
        "y_basis": "CMCS 8 / 2, rounded up",
        "z": 10,
        "exposure": 9,
        "reason": null
      },
      "cmcs": {
        "score": 8,
        "basis": "container image",
        "components": [
          {
            "term": "location",
            "value": 5,
            "basis": "container image"
          },
          {
            "term": "spread",
            "value": 1,
            "basis": "5 files"
          },
          {
            "term": "vendor",
            "value": 1,
            "basis": "a vendor or upstream release controls it"
          },
          {
            "term": "renegotiation",
            "value": 1,
            "basis": "both peers must change (key exchange / protocol)"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "RSA-2048 is disallowed today under NIST SP 800-52 Rev.2 (TLS guidelines); Shor-breakable; Mosca +9 yrs (X 15 + Y 4 \u2212 Z 10), so quantum-exposed; evidence observed. MIGRATE because it is already classically broken, and disallowed crypto is never accepted and it is quantum-exposed by 9 yrs; it can be changed in 4 locations you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "RSA signatures",
        "to": "ML-DSA-65 (hybrid first)",
        "note": "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
      },
      {
        "from": "RSA key exchange / encryption",
        "to": "ML-KEM-768 (X25519MLKEM768 hybrid)",
        "note": "ML-KEM-768 public key 1,184 B (vs 32 B X25519) - larger TLS handshake"
      },
      {
        "from": "TLSv1",
        "to": "TLS 1.2+ / TLS 1.3",
        "note": null
      },
      {
        "from": "TLSv1.1",
        "to": "TLS 1.2+ / TLS 1.3",
        "note": null
      },
      {
        "from": "3DES",
        "to": "AES-256-GCM",
        "note": null
      }
    ],
    "size_notes": [
      "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs",
      "ML-KEM-768 public key 1,184 B (vs 32 B X25519) - larger TLS handshake"
    ],
    "wave": 1,
    "wave_reason": "disallowed today under NIST SP 800-131A Rev.2: it is already classically broken, so it is wave 1",
    "priority": "P1",
    "priority_reason": "Disallowed today (Wave 1)",
    "verify_first": false,
    "id": 255,
    "fix_finding": 362,
    "primary_location": "certs/api-gw.crt:1",
    "locations_count": 8,
    "findings_count": 8,
    "planes": [
      "certificates",
      "configs",
      "containers"
    ],
    "files": [
      "certs/api-gw.crt",
      "certs/api-gw.key",
      "conf/nginx.conf",
      "image/app-image.tar!/app/certs/api-gw.crt",
      "keystore/app.p12"
    ]
  },
  {
    "key": "3f828ea7ca90b26a4f8333a00323f7b63eaed6d0d1176e3c98c258c59a41b288",
    "fingerprint": "3f828ea7ca90b26a4f8333a00323f7b63eaed6d0d1176e3c98c258c59a41b288",
    "label": "RSA-1024 legacy-portal.crt",
    "algorithm": "RSA",
    "key_size": 1024,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 75.6,
    "tier": "Critical",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 40,
          "basis": "disallowed",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 15,
          "basis": "shor",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 8,
          "basis": "observed"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 63
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 1.0,
          "basis": "high"
        }
      ],
      "exact": 75.6,
      "base_status": "disallowed",
      "quantum": "shor",
      "quantum_vulnerable": true,
      "evidence": "observed",
      "evidence_label": "Observed",
      "confidence": "high",
      "criticality": 3,
      "threats": [
        "forgery",
        "classical"
      ],
      "purposes": [
        {
          "file": "certs/legacy-portal.crt",
          "line": 1,
          "purpose": "sign",
          "evidence": "an X.509 certificate key signs; key transport through it is recorded as a separate cipher finding"
        }
      ],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 1,
        "y_basis": "CMCS 2 / 2, rounded up",
        "z": 10,
        "exposure": -4,
        "reason": null
      },
      "cmcs": {
        "score": 2,
        "basis": "certificate re-issue",
        "components": [
          {
            "term": "location",
            "value": 2,
            "basis": "certificate re-issue"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "RSA-1024 is disallowed today under NIST SP 800-131A Rev.2 (2019); Shor-breakable; Mosca -4 yrs (X 5 + Y 1 \u2212 Z 10), so not quantum-exposed; evidence observed. MIGRATE because it is already classically broken, and disallowed crypto is never accepted; it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "RSA signatures",
        "to": "ML-DSA-65 (hybrid first)",
        "note": "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
      }
    ],
    "size_notes": [
      "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
    ],
    "wave": 1,
    "wave_reason": "disallowed today under NIST SP 800-131A Rev.2: it is already classically broken, so it is wave 1. Mosca exposure is -4 yrs: it is not quantum-exposed, but no quantum computer is needed to break it. Mosca only measures the quantum deadline; this asset fails without one",
    "priority": "P1",
    "priority_reason": "Disallowed today (Wave 1)",
    "verify_first": false,
    "id": 258,
    "fix_finding": null,
    "primary_location": "certs/legacy-portal.crt:1",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "certificates"
    ],
    "files": [
      "certs/legacy-portal.crt"
    ]
  },
  {
    "key": "configs:conf/java.security:3:DES",
    "fingerprint": null,
    "label": "DES conf/java.security:3",
    "algorithm": "DES",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 52.0,
    "tier": "High",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 40,
          "basis": "disallowed",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 7,
          "basis": "grover",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 51
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 52.02,
      "base_status": "disallowed",
      "quantum": "grover",
      "quantum_vulnerable": false,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "classical"
      ],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 1,
        "y_basis": "CMCS 2 / 2, rounded up",
        "z": 10,
        "exposure": -4,
        "reason": null
      },
      "cmcs": {
        "score": 2,
        "basis": "configuration change",
        "components": [
          {
            "term": "location",
            "value": 2,
            "basis": "configuration change"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "DES is disallowed today under NIST SP 800-131A Rev.2 (2019); Grover-weakened only; Mosca -4 yrs (X 5 + Y 1 \u2212 Z 10), so not quantum-exposed; evidence declared. MIGRATE because it is already classically broken, and disallowed crypto is never accepted; it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "DES",
        "to": "AES-256-GCM",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 1,
    "wave_reason": "disallowed today under NIST SP 800-131A Rev.2: it is already classically broken, so it is wave 1. Mosca exposure is -4 yrs: it is not quantum-exposed, but no quantum computer is needed to break it. Mosca only measures the quantum deadline; this asset fails without one",
    "priority": "P1",
    "priority_reason": "Disallowed today (Wave 1)",
    "verify_first": false,
    "id": 267,
    "fix_finding": null,
    "primary_location": "conf/java.security:3",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "configs"
    ],
    "files": [
      "conf/java.security"
    ]
  },
  {
    "key": "configs:conf/java.security:3:3DES",
    "fingerprint": null,
    "label": "3DES conf/java.security:3",
    "algorithm": "3DES",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 52.0,
    "tier": "High",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 40,
          "basis": "disallowed",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 7,
          "basis": "grover",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 51
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 52.02,
      "base_status": "disallowed",
      "quantum": "grover",
      "quantum_vulnerable": false,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "classical"
      ],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 1,
        "y_basis": "CMCS 2 / 2, rounded up",
        "z": 10,
        "exposure": -4,
        "reason": null
      },
      "cmcs": {
        "score": 2,
        "basis": "configuration change",
        "components": [
          {
            "term": "location",
            "value": 2,
            "basis": "configuration change"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "3DES is disallowed today under NIST SP 800-131A Rev.2 (2019); Grover-weakened only; Mosca -4 yrs (X 5 + Y 1 \u2212 Z 10), so not quantum-exposed; evidence declared. MIGRATE because it is already classically broken, and disallowed crypto is never accepted; it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "3DES",
        "to": "AES-256-GCM",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 1,
    "wave_reason": "disallowed today under NIST SP 800-131A Rev.2: it is already classically broken, so it is wave 1. Mosca exposure is -4 yrs: it is not quantum-exposed, but no quantum computer is needed to break it. Mosca only measures the quantum deadline; this asset fails without one",
    "priority": "P1",
    "priority_reason": "Disallowed today (Wave 1)",
    "verify_first": false,
    "id": 268,
    "fix_finding": null,
    "primary_location": "conf/java.security:3",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "configs"
    ],
    "files": [
      "conf/java.security"
    ]
  },
  {
    "key": "code:payments/Crypto.java:16:DES",
    "fingerprint": null,
    "label": "DES payments/Crypto.java:16",
    "algorithm": "DES",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 52.0,
    "tier": "Critical",
    "priority_override": "P1",
    "owner": "Alice",
    "status": "In progress",
    "notes": "Test note",
    "edited": true,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 40,
          "basis": "disallowed",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 7,
          "basis": "grover",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 51
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 52.02,
      "base_status": "disallowed",
      "quantum": "grover",
      "quantum_vulnerable": false,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "classical"
      ],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 15,
        "x_basis": "path tag 'payments': long-lived secrets",
        "y": 2,
        "y_basis": "CMCS 4 / 2, rounded up",
        "z": 10,
        "exposure": 7,
        "reason": null
      },
      "cmcs": {
        "score": 4,
        "basis": "hardcoded in source",
        "components": [
          {
            "term": "location",
            "value": 4,
            "basis": "hardcoded in source"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "DES is disallowed today under NIST SP 800-131A Rev.2 (2019); Grover-weakened only; Mosca +7 yrs (X 15 + Y 2 \u2212 Z 10): past the quantum horizon, where Grover halves its strength; evidence declared. MIGRATE because it is already classically broken, and disallowed crypto is never accepted and its data outlives the quantum horizon by 7 yrs; it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "DES",
        "to": "AES-256-GCM",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 1,
    "wave_reason": "disallowed today under NIST SP 800-131A Rev.2: it is already classically broken, so it is wave 1",
    "priority": "P1",
    "priority_reason": "Analyst override (P1)",
    "verify_first": false,
    "id": 273,
    "fix_finding": null,
    "primary_location": "payments/Crypto.java:16",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "code"
    ],
    "files": [
      "payments/Crypto.java"
    ]
  },
  {
    "key": "code:auth/passwords.py:5:MD5",
    "fingerprint": null,
    "label": "MD5 auth/passwords.py:5",
    "algorithm": "MD5",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 36.7,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 25,
          "basis": "not_approved",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 7,
          "basis": "grover",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 36
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 36.72,
      "base_status": "not_approved",
      "quantum": "grover",
      "quantum_vulnerable": false,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "classical"
      ],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 15,
        "x_basis": "path tag 'auth': long-lived secrets",
        "y": 2,
        "y_basis": "CMCS 4 / 2, rounded up",
        "z": 10,
        "exposure": 7,
        "reason": null
      },
      "cmcs": {
        "score": 4,
        "basis": "hardcoded in source",
        "components": [
          {
            "term": "location",
            "value": 4,
            "basis": "hardcoded in source"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "MD5 is not approved under NIST SP 800-131A Rev.2 (2019); Grover-weakened only; Mosca +7 yrs (X 15 + Y 2 \u2212 Z 10): past the quantum horizon, where Grover halves its strength; evidence declared. MIGRATE because it is Medium risk (36.7) and its data outlives the quantum horizon by 7 yrs; it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "MD5",
        "to": "SHA-256",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 2,
    "wave_reason": "Mosca exposure +7 yrs: data outlives the quantum horizon once migration time is added, so it starts in wave 2 whatever its Medium risk tier",
    "priority": "P3",
    "priority_reason": "Planned migrate (Wave 2)",
    "verify_first": false,
    "id": 265,
    "fix_finding": 350,
    "primary_location": "auth/passwords.py:5",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "code"
    ],
    "files": [
      "auth/passwords.py"
    ]
  },
  {
    "key": "configs:conf/java.security:3:RC4",
    "fingerprint": null,
    "label": "RC4 conf/java.security:3",
    "algorithm": "RC4",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 36.7,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 25,
          "basis": "not_approved",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 7,
          "basis": "grover",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 36
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 36.72,
      "base_status": "not_approved",
      "quantum": "grover",
      "quantum_vulnerable": false,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "classical"
      ],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 1,
        "y_basis": "CMCS 2 / 2, rounded up",
        "z": 10,
        "exposure": -4,
        "reason": null
      },
      "cmcs": {
        "score": 2,
        "basis": "configuration change",
        "components": [
          {
            "term": "location",
            "value": 2,
            "basis": "configuration change"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "RC4 is not approved under NIST SP 800-131A Rev.2 (2019); Grover-weakened only; Mosca -4 yrs (X 5 + Y 1 \u2212 Z 10), so not quantum-exposed; evidence declared. MIGRATE because it is Medium risk (36.7); it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "RC4",
        "to": "AES-256-GCM",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 4,
    "wave_reason": "Medium risk tier and not quantum-exposed yet (Mosca -4 yrs), so one wave after its tier",
    "priority": "P3",
    "priority_reason": "Planned migrate (Wave 4)",
    "verify_first": false,
    "id": 269,
    "fix_finding": null,
    "primary_location": "conf/java.security:3",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "configs"
    ],
    "files": [
      "conf/java.security"
    ]
  },
  {
    "key": "code:payments/Crypto.java:6:SHA-1",
    "fingerprint": null,
    "label": "SHA-1 payments/Crypto.java:6",
    "algorithm": "SHA-1",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 36.7,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 25,
          "basis": "deprecated",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)",
            "NIST announcement: SHA-1 to be retired by 31 Dec 2030"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 7,
          "basis": "grover",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 36
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 36.72,
      "base_status": "deprecated",
      "quantum": "grover",
      "quantum_vulnerable": false,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "classical"
      ],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 15,
        "x_basis": "path tag 'payments': long-lived secrets",
        "y": 2,
        "y_basis": "CMCS 4 / 2, rounded up",
        "z": 10,
        "exposure": 7,
        "reason": null
      },
      "cmcs": {
        "score": 4,
        "basis": "hardcoded in source",
        "components": [
          {
            "term": "location",
            "value": 4,
            "basis": "hardcoded in source"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "SHA-1 is deprecated today under NIST SP 800-131A Rev.2 (2019); Grover-weakened only; Mosca +7 yrs (X 15 + Y 2 \u2212 Z 10): past the quantum horizon, where Grover halves its strength; evidence declared. MIGRATE because it is Medium risk (36.7) and its data outlives the quantum horizon by 7 yrs; it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "SHA-1",
        "to": "SHA-256",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 2,
    "wave_reason": "Mosca exposure +7 yrs: data outlives the quantum horizon once migration time is added, so it starts in wave 2 whatever its Medium risk tier",
    "priority": "P3",
    "priority_reason": "Planned migrate (Wave 2)",
    "verify_first": false,
    "id": 271,
    "fix_finding": 369,
    "primary_location": "payments/Crypto.java:6",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "code"
    ],
    "files": [
      "payments/Crypto.java"
    ]
  },
  {
    "key": "code:utils/legacy_aes.py:5:AES",
    "fingerprint": null,
    "label": "AES utils/legacy_aes.py:5",
    "algorithm": "AES",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 36.7,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 25,
          "basis": "deprecated",
          "citation": [
            "NIST SP 800-131A Rev.3 initial public draft (2024) - proposed changes"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 7,
          "basis": "grover",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 36
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 36.72,
      "base_status": "deprecated",
      "quantum": "grover",
      "quantum_vulnerable": false,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 2,
        "y_basis": "CMCS 4 / 2, rounded up",
        "z": 10,
        "exposure": -3,
        "reason": null
      },
      "cmcs": {
        "score": 4,
        "basis": "hardcoded in source",
        "components": [
          {
            "term": "location",
            "value": 4,
            "basis": "hardcoded in source"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "AES is deprecated today under NIST SP 800-131A Rev.3 initial public draft (2024) - proposed changes; Grover-weakened only; Mosca -3 yrs (X 5 + Y 2 \u2212 Z 10), so not quantum-exposed; evidence declared. MIGRATE because it is Medium risk (36.7); it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "AES ECB",
        "to": "AES-256-GCM",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 4,
    "wave_reason": "Medium risk tier and not quantum-exposed yet (Mosca -3 yrs), so one wave after its tier",
    "priority": "P3",
    "priority_reason": "Planned migrate (Wave 4)",
    "verify_first": false,
    "id": 275,
    "fix_finding": null,
    "primary_location": "utils/legacy_aes.py:5",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "code"
    ],
    "files": [
      "utils/legacy_aes.py"
    ]
  },
  {
    "key": "code:web/sign.js:4:MD5",
    "fingerprint": null,
    "label": "MD5 web/sign.js:4",
    "algorithm": "MD5",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 36.7,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 25,
          "basis": "not_approved",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 7,
          "basis": "grover",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 36
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 36.72,
      "base_status": "not_approved",
      "quantum": "grover",
      "quantum_vulnerable": false,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "classical"
      ],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 2,
        "y_basis": "CMCS 4 / 2, rounded up",
        "z": 10,
        "exposure": -3,
        "reason": null
      },
      "cmcs": {
        "score": 4,
        "basis": "hardcoded in source",
        "components": [
          {
            "term": "location",
            "value": 4,
            "basis": "hardcoded in source"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "MD5 is not approved under NIST SP 800-131A Rev.2 (2019); Grover-weakened only; Mosca -3 yrs (X 5 + Y 2 \u2212 Z 10), so not quantum-exposed; evidence declared. MIGRATE because it is Medium risk (36.7); it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "MD5",
        "to": "SHA-256",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 4,
    "wave_reason": "Medium risk tier and not quantum-exposed yet (Mosca -3 yrs), so one wave after its tier",
    "priority": "P3",
    "priority_reason": "Planned migrate (Wave 4)",
    "verify_first": false,
    "id": 279,
    "fix_finding": 377,
    "primary_location": "web/sign.js:4",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "code"
    ],
    "files": [
      "web/sign.js"
    ]
  },
  {
    "key": "code:auth/token_signer.py:10:RSA",
    "fingerprint": null,
    "label": "RSA auth/token_signer.py:10",
    "algorithm": "RSA",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 34.7,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 15,
          "basis": "unknown",
          "citation": []
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 15,
          "basis": "shor",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 34
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 34.68,
      "base_status": "unknown",
      "quantum": "shor",
      "quantum_vulnerable": true,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "forgery"
      ],
      "purposes": [
        {
          "file": "auth/token_signer.py",
          "line": 10,
          "purpose": "sign",
          "evidence": "call on auth/token_signer.py:10: return key.sign(payload, padding.PKCS1v15(), hashes.SHA256())"
        }
      ],
      "mosca": {
        "applies": true,
        "x": 15,
        "x_basis": "path tag 'auth': long-lived secrets",
        "y": 2,
        "y_basis": "CMCS 4 / 2, rounded up",
        "z": 10,
        "exposure": 7,
        "reason": null
      },
      "cmcs": {
        "score": 4,
        "basis": "hardcoded in source",
        "components": [
          {
            "term": "location",
            "value": 4,
            "basis": "hardcoded in source"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "RSA is unrated (no NIST rule matches its name or key size); Shor-breakable; Mosca +7 yrs (X 15 + Y 2 \u2212 Z 10), so quantum-exposed; evidence declared. MIGRATE because it is Medium risk (34.7) and it is quantum-exposed by 7 yrs; it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "RSA signatures",
        "to": "ML-DSA-65 (hybrid first)",
        "note": "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
      }
    ],
    "size_notes": [
      "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
    ],
    "wave": 2,
    "wave_reason": "Mosca exposure +7 yrs: data outlives the quantum horizon once migration time is added, so it starts in wave 2 whatever its Medium risk tier",
    "priority": "P2",
    "priority_reason": "Quantum-exposed: Mosca +7 yrs",
    "verify_first": false,
    "id": 266,
    "fix_finding": null,
    "primary_location": "auth/token_signer.py:10",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "code"
    ],
    "files": [
      "auth/token_signer.py"
    ]
  },
  {
    "key": "code:web/sign.js:8:RSA",
    "fingerprint": null,
    "label": "RSA web/sign.js:8",
    "algorithm": "RSA",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 34.7,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 15,
          "basis": "unknown",
          "citation": []
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 15,
          "basis": "shor",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 34
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 34.68,
      "base_status": "unknown",
      "quantum": "shor",
      "quantum_vulnerable": true,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "forgery"
      ],
      "purposes": [
        {
          "file": "web/sign.js",
          "line": 8,
          "purpose": "sign",
          "evidence": "call on web/sign.js:8: const signer = crypto.createSign('RSA-SHA256');"
        }
      ],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 2,
        "y_basis": "CMCS 4 / 2, rounded up",
        "z": 10,
        "exposure": -3,
        "reason": null
      },
      "cmcs": {
        "score": 4,
        "basis": "hardcoded in source",
        "components": [
          {
            "term": "location",
            "value": 4,
            "basis": "hardcoded in source"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "RSA is unrated (no NIST rule matches its name or key size); Shor-breakable; Mosca -3 yrs (X 5 + Y 2 \u2212 Z 10), so not quantum-exposed; evidence declared. MIGRATE because it is Medium risk (34.7); it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "RSA signatures",
        "to": "ML-DSA-65 (hybrid first)",
        "note": "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
      }
    ],
    "size_notes": [
      "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
    ],
    "wave": 4,
    "wave_reason": "Medium risk tier and not quantum-exposed yet (Mosca -3 yrs), so one wave after its tier",
    "priority": "P3",
    "priority_reason": "Planned migrate (Wave 4)",
    "verify_first": false,
    "id": 280,
    "fix_finding": null,
    "primary_location": "web/sign.js:8",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "code"
    ],
    "files": [
      "web/sign.js"
    ]
  },
  {
    "key": "2653b177d3e98c911a2c2da854f3723e84a8eaf820c60145f0d0400fafd55740",
    "fingerprint": "2653b177d3e98c911a2c2da854f3723e84a8eaf820c60145f0d0400fafd55740",
    "label": "ECDSA-256 ecdsa-p256.crt",
    "algorithm": "ECDSA",
    "key_size": 256,
    "hybrid": true,
    "hybrid_ineffective": [],
    "summary": "3 findings \u2192 1 asset",
    "score": 33.6,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 5,
          "basis": "approved",
          "citation": [
            "FIPS 186-5 (2023) Digital Signature Standard",
            "NIST IR 8547 initial public draft (2024) - quantum transition timeline"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 15,
          "basis": "shor",
          "note": "hybrid X25519MLKEM768 is negotiable per the config (declared, not observed: the offline probe cannot offer it); classical fallbacks are still scored"
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 8,
          "basis": "observed"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 28
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 1.0,
          "basis": "high"
        }
      ],
      "exact": 33.6,
      "base_status": "approved",
      "quantum": "shor",
      "quantum_vulnerable": true,
      "evidence": "observed",
      "evidence_label": "Observed",
      "confidence": "high",
      "criticality": 3,
      "threats": [
        "hndl",
        "forgery"
      ],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 2,
        "y_basis": "CMCS 3 / 2, rounded up",
        "z": 10,
        "exposure": -3,
        "reason": null
      },
      "cmcs": {
        "score": 3,
        "basis": "certificate re-issue",
        "components": [
          {
            "term": "location",
            "value": 2,
            "basis": "certificate re-issue"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "2 files"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 1,
            "basis": "both peers must change (key exchange / protocol)"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "ECDSA-256 is approved today under FIPS 186-5 (2023) Digital Signature Standard; Shor-breakable; Mosca -3 yrs (X 5 + Y 2 \u2212 Z 10), so not quantum-exposed; evidence observed. MIGRATE because it is Medium risk (33.6); it can be changed in 2 locations you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "ECDSA signatures",
        "to": "ML-DSA-65 (hybrid first)",
        "note": "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
      },
      {
        "from": "X25519 key exchange",
        "to": "ML-KEM-768 (X25519MLKEM768 hybrid)",
        "note": "ML-KEM-768 public key 1,184 B (vs 32 B X25519) - larger TLS handshake"
      }
    ],
    "size_notes": [
      "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs",
      "ML-KEM-768 public key 1,184 B (vs 32 B X25519) - larger TLS handshake"
    ],
    "wave": 4,
    "wave_reason": "Medium risk tier and not quantum-exposed yet (Mosca -3 yrs), so one wave after its tier",
    "priority": "P3",
    "priority_reason": "Planned migrate (Wave 4)",
    "verify_first": false,
    "id": 256,
    "fix_finding": null,
    "primary_location": "certs/ecdsa-p256.crt:1",
    "locations_count": 3,
    "findings_count": 3,
    "planes": [
      "certificates",
      "configs"
    ],
    "files": [
      "certs/ecdsa-p256.crt",
      "conf/nginx-edge.conf"
    ]
  },
  {
    "key": "7165beca4bed6923154ec861a705e39bac046a738471f34745759786ce1c495c",
    "fingerprint": "7165beca4bed6923154ec861a705e39bac046a738471f34745759786ce1c495c",
    "label": "RSA-4096 internal-ca.crt",
    "algorithm": "RSA",
    "key_size": 4096,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 33.6,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 5,
          "basis": "approved",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)",
            "NIST IR 8547 initial public draft (2024) - quantum transition timeline"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 15,
          "basis": "shor",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 8,
          "basis": "observed"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 28
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 1.0,
          "basis": "high"
        }
      ],
      "exact": 33.6,
      "base_status": "approved",
      "quantum": "shor",
      "quantum_vulnerable": true,
      "evidence": "observed",
      "evidence_label": "Observed",
      "confidence": "high",
      "criticality": 3,
      "threats": [
        "forgery"
      ],
      "purposes": [
        {
          "file": "certs/internal-ca.crt",
          "line": 1,
          "purpose": "sign",
          "evidence": "an X.509 certificate key signs; key transport through it is recorded as a separate cipher finding"
        }
      ],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 1,
        "y_basis": "CMCS 2 / 2, rounded up",
        "z": 10,
        "exposure": -4,
        "reason": null
      },
      "cmcs": {
        "score": 2,
        "basis": "certificate re-issue",
        "components": [
          {
            "term": "location",
            "value": 2,
            "basis": "certificate re-issue"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "RSA-4096 is approved today under NIST SP 800-131A Rev.2 (2019); Shor-breakable; Mosca -4 yrs (X 5 + Y 1 \u2212 Z 10), so not quantum-exposed; evidence observed. MIGRATE because it is Medium risk (33.6); it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "RSA signatures",
        "to": "ML-DSA-65 (hybrid first)",
        "note": "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
      }
    ],
    "size_notes": [
      "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
    ],
    "wave": 4,
    "wave_reason": "Medium risk tier and not quantum-exposed yet (Mosca -4 yrs), so one wave after its tier",
    "priority": "P3",
    "priority_reason": "Planned migrate (Wave 4)",
    "verify_first": false,
    "id": 257,
    "fix_finding": null,
    "primary_location": "certs/internal-ca.crt:1",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "certificates"
    ],
    "files": [
      "certs/internal-ca.crt"
    ]
  },
  {
    "key": "binaries:vendor/sync-agent.bin:0:MD5",
    "fingerprint": null,
    "label": "MD5 vendor/sync-agent.bin:0",
    "algorithm": "MD5",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 26.9,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 25,
          "basis": "not_approved",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 7,
          "basis": "grover",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 0,
          "basis": "textual"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 32
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.7,
          "basis": "low"
        }
      ],
      "exact": 26.88,
      "base_status": "not_approved",
      "quantum": "grover",
      "quantum_vulnerable": false,
      "evidence": "textual",
      "evidence_label": "Textual",
      "confidence": "low",
      "criticality": 3,
      "threats": [
        "classical"
      ],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 5,
        "y_basis": "CMCS 9 / 2, rounded up",
        "z": 10,
        "exposure": 0,
        "reason": null
      },
      "cmcs": {
        "score": 9,
        "basis": "compiled into a binary",
        "components": [
          {
            "term": "location",
            "value": 8,
            "basis": "compiled into a binary"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 1,
            "basis": "a vendor or upstream release controls it"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "CONTAIN",
    "reason": "MD5 is not approved under NIST SP 800-131A Rev.2 (2019); Grover-weakened only; Mosca +0 yrs (X 5 + Y 5 \u2212 Z 10), so not quantum-exposed; evidence textual (a string match, not a parsed artefact). CONTAIN because migration takes Y = 5 yrs (CMCS 9: compiled into a binary), too long to patch in place",
    "recommendations": [
      "Segment the network path to this asset",
      "Front it with a crypto-agile gateway",
      "Shorten key lifetime / rotate more often"
    ],
    "replacements": [
      {
        "from": "MD5",
        "to": "SHA-256",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 4,
    "wave_reason": "Medium risk tier and not quantum-exposed yet (Mosca +0 yrs), so one wave after its tier",
    "priority": "P3",
    "priority_reason": "Planned contain (Wave 4)",
    "verify_first": true,
    "id": 278,
    "fix_finding": null,
    "primary_location": "vendor/sync-agent.bin",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "binaries"
    ],
    "files": [
      "vendor/sync-agent.bin"
    ]
  },
  {
    "key": "binaries:vendor/sync-agent.bin:0:RSA",
    "fingerprint": null,
    "label": "RSA vendor/sync-agent.bin:0",
    "algorithm": "RSA",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 25.2,
    "tier": "Medium",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 15,
          "basis": "unknown",
          "citation": []
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 15,
          "basis": "shor",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 0,
          "basis": "textual"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 30
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.7,
          "basis": "low"
        }
      ],
      "exact": 25.2,
      "base_status": "unknown",
      "quantum": "shor",
      "quantum_vulnerable": true,
      "evidence": "textual",
      "evidence_label": "Textual",
      "confidence": "low",
      "criticality": 3,
      "threats": [
        "undetermined"
      ],
      "purposes": [
        {
          "file": "vendor/sync-agent.bin",
          "line": 0,
          "purpose": "undetermined",
          "evidence": "no usage declared at this location (key generation, a string match, or a bare key spec)"
        }
      ],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 5,
        "y_basis": "CMCS 9 / 2, rounded up",
        "z": 10,
        "exposure": 0,
        "reason": null
      },
      "cmcs": {
        "score": 9,
        "basis": "compiled into a binary",
        "components": [
          {
            "term": "location",
            "value": 8,
            "basis": "compiled into a binary"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 1,
            "basis": "a vendor or upstream release controls it"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "CONTAIN",
    "reason": "RSA is unrated (no NIST rule matches its name or key size); Shor-breakable; Mosca +0 yrs (X 5 + Y 5 \u2212 Z 10), so not quantum-exposed; evidence textual (a string match, not a parsed artefact). CONTAIN because migration takes Y = 5 yrs (CMCS 9: compiled into a binary), too long to patch in place",
    "recommendations": [
      "Segment the network path to this asset",
      "Front it with a crypto-agile gateway",
      "Shorten key lifetime / rotate more often"
    ],
    "replacements": [
      {
        "from": "RSA, if used for signing",
        "to": "ML-DSA-65 (hybrid first)",
        "note": "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
      },
      {
        "from": "RSA, if used for encryption",
        "to": "ML-KEM-768 (X25519MLKEM768 hybrid)",
        "note": "ML-KEM-768 public key 1,184 B (vs 32 B X25519) - larger TLS handshake"
      }
    ],
    "size_notes": [
      "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs",
      "ML-KEM-768 public key 1,184 B (vs 32 B X25519) - larger TLS handshake"
    ],
    "wave": 4,
    "wave_reason": "Medium risk tier and not quantum-exposed yet (Mosca +0 yrs), so one wave after its tier",
    "priority": "P3",
    "priority_reason": "Planned contain (Wave 4)",
    "verify_first": true,
    "id": 277,
    "fix_finding": null,
    "primary_location": "vendor/sync-agent.bin",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "binaries"
    ],
    "files": [
      "vendor/sync-agent.bin"
    ]
  },
  {
    "key": "configs:infra/kms.tf:4:RSA",
    "fingerprint": null,
    "label": "RSA-2048 infra/kms.tf:4",
    "algorithm": "RSA",
    "key_size": 2048,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 24.5,
    "tier": "Low",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 5,
          "basis": "approved",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)",
            "NIST IR 8547 initial public draft (2024) - quantum transition timeline"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 15,
          "basis": "shor",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 24
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 24.48,
      "base_status": "approved",
      "quantum": "shor",
      "quantum_vulnerable": true,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "forgery"
      ],
      "purposes": [
        {
          "file": "infra/kms.tf",
          "line": 4,
          "purpose": "sign",
          "evidence": "line 3: key_usage   = \"SIGN_VERIFY\""
        }
      ],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 5,
        "y_basis": "CMCS 10 / 2, rounded up",
        "z": 10,
        "exposure": 0,
        "reason": null
      },
      "cmcs": {
        "score": 10,
        "basis": "firmware / HSM / KMS",
        "components": [
          {
            "term": "location",
            "value": 10,
            "basis": "firmware / HSM / KMS"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "CONTAIN",
    "reason": "RSA-2048 is approved today under NIST SP 800-131A Rev.2 (2019); Shor-breakable; Mosca +0 yrs (X 5 + Y 5 \u2212 Z 10), so not quantum-exposed; evidence declared. CONTAIN because migration takes Y = 5 yrs (CMCS 10: firmware / HSM / KMS), too long to patch in place",
    "recommendations": [
      "Segment the network path to this asset",
      "Front it with a crypto-agile gateway",
      "Shorten key lifetime / rotate more often"
    ],
    "replacements": [
      {
        "from": "RSA signatures",
        "to": "ML-DSA-65 (hybrid first)",
        "note": "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
      }
    ],
    "size_notes": [
      "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
    ],
    "wave": 4,
    "wave_reason": "Low risk tier and not quantum-exposed yet (Mosca +0 yrs), so one wave after its tier",
    "priority": "P3",
    "priority_reason": "Planned contain (Wave 4)",
    "verify_first": false,
    "id": 270,
    "fix_finding": null,
    "primary_location": "infra/kms.tf:4",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "configs"
    ],
    "files": [
      "infra/kms.tf"
    ]
  },
  {
    "key": "code:payments/Crypto.java:11:RSA",
    "fingerprint": null,
    "label": "RSA-2048 payments/Crypto.java:11",
    "algorithm": "RSA",
    "key_size": 2048,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 24.5,
    "tier": "Low",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 5,
          "basis": "approved",
          "citation": [
            "NIST SP 800-131A Rev.2 (2019)",
            "NIST IR 8547 initial public draft (2024) - quantum transition timeline"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 15,
          "basis": "shor",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 24
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 24.48,
      "base_status": "approved",
      "quantum": "shor",
      "quantum_vulnerable": true,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "undetermined"
      ],
      "purposes": [
        {
          "file": "payments/Crypto.java",
          "line": 11,
          "purpose": "undetermined",
          "evidence": "no usage declared at this location (key generation, a string match, or a bare key spec)"
        }
      ],
      "mosca": {
        "applies": true,
        "x": 15,
        "x_basis": "path tag 'payments': long-lived secrets",
        "y": 2,
        "y_basis": "CMCS 4 / 2, rounded up",
        "z": 10,
        "exposure": 7,
        "reason": null
      },
      "cmcs": {
        "score": 4,
        "basis": "hardcoded in source",
        "components": [
          {
            "term": "location",
            "value": 4,
            "basis": "hardcoded in source"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "MIGRATE",
    "reason": "RSA-2048 is approved today under NIST SP 800-131A Rev.2 (2019); Shor-breakable; Mosca +7 yrs (X 15 + Y 2 \u2212 Z 10), so quantum-exposed; evidence declared. MIGRATE because it is quantum-exposed by 7 yrs; it can be changed in 1 location you control",
    "recommendations": [
      "Replace per the PQC map",
      "Deploy hybrid first, then retire the classical algorithm"
    ],
    "replacements": [
      {
        "from": "RSA, if used for signing",
        "to": "ML-DSA-65 (hybrid first)",
        "note": "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
      },
      {
        "from": "RSA, if used for encryption",
        "to": "ML-KEM-768 (X25519MLKEM768 hybrid)",
        "note": "ML-KEM-768 public key 1,184 B (vs 32 B X25519) - larger TLS handshake"
      }
    ],
    "size_notes": [
      "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs",
      "ML-KEM-768 public key 1,184 B (vs 32 B X25519) - larger TLS handshake"
    ],
    "wave": 2,
    "wave_reason": "Mosca exposure +7 yrs: data outlives the quantum horizon once migration time is added, so it starts in wave 2 whatever its Low risk tier",
    "priority": "P2",
    "priority_reason": "Quantum-exposed: Mosca +7 yrs",
    "verify_first": false,
    "id": 272,
    "fix_finding": 370,
    "primary_location": "payments/Crypto.java:11",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "code"
    ],
    "files": [
      "payments/Crypto.java"
    ]
  },
  {
    "key": "code:services/ecdsa.go:10:ECDSA",
    "fingerprint": null,
    "label": "ECDSA-256 services/ecdsa.go:10",
    "algorithm": "ECDSA",
    "key_size": 256,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 24.5,
    "tier": "Low",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 5,
          "basis": "approved",
          "citation": [
            "FIPS 186-5 (2023) Digital Signature Standard",
            "NIST IR 8547 initial public draft (2024) - quantum transition timeline"
          ]
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 15,
          "basis": "shor",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 4,
          "basis": "declared"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 24
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.85,
          "basis": "medium"
        }
      ],
      "exact": 24.48,
      "base_status": "approved",
      "quantum": "shor",
      "quantum_vulnerable": true,
      "evidence": "declared",
      "evidence_label": "Declared",
      "confidence": "medium",
      "criticality": 3,
      "threats": [
        "forgery"
      ],
      "purposes": [],
      "mosca": {
        "applies": true,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 2,
        "y_basis": "CMCS 4 / 2, rounded up",
        "z": 10,
        "exposure": -3,
        "reason": null
      },
      "cmcs": {
        "score": 4,
        "basis": "hardcoded in source",
        "components": [
          {
            "term": "location",
            "value": 4,
            "basis": "hardcoded in source"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 0,
            "basis": "you control the code"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "ACCEPT",
    "reason": "ECDSA-256 is approved today under FIPS 186-5 (2023) Digital Signature Standard; Shor-breakable; Mosca -3 yrs (X 5 + Y 2 \u2212 Z 10), so not quantum-exposed; evidence declared. ACCEPT because it is Low risk (24.5) and not quantum-exposed",
    "recommendations": [
      "Monitor; re-assess at next scan"
    ],
    "replacements": [
      {
        "from": "ECDSA signatures",
        "to": "ML-DSA-65 (hybrid first)",
        "note": "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
      }
    ],
    "size_notes": [
      "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
    ],
    "wave": 5,
    "wave_reason": "accepted risk: validate at the next scan and attest",
    "priority": "P4",
    "priority_reason": "Accepted risk / monitor next scan",
    "verify_first": false,
    "id": 274,
    "fix_finding": null,
    "primary_location": "services/ecdsa.go:10",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "code"
    ],
    "files": [
      "services/ecdsa.go"
    ]
  },
  {
    "key": "containers:Dockerfile:2:OpenSSL 1.1.1k",
    "fingerprint": null,
    "label": "OpenSSL 1.1.1k Dockerfile:2",
    "algorithm": "OpenSSL 1.1.1k",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 14.3,
    "tier": "Low",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 15,
          "basis": "unknown",
          "citation": []
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 0,
          "basis": "none",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 2,
          "basis": "unverified"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 17
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.7,
          "basis": "low"
        }
      ],
      "exact": 14.28,
      "base_status": "unknown",
      "quantum": "none",
      "quantum_vulnerable": false,
      "evidence": "unverified",
      "evidence_label": "Declared, unverified",
      "confidence": "low",
      "criticality": 3,
      "threats": [],
      "purposes": [],
      "mosca": {
        "applies": false,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 3,
        "y_basis": "CMCS 6 / 2, rounded up",
        "z": 10,
        "exposure": null,
        "reason": "no algorithm identified: only a library or package name was found"
      },
      "cmcs": {
        "score": 6,
        "basis": "container image",
        "components": [
          {
            "term": "location",
            "value": 5,
            "basis": "container image"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 1,
            "basis": "a vendor or upstream release controls it"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "ACCEPT",
    "reason": "OpenSSL 1.1.1k is unrated (no NIST rule matches its name or key size); not quantum-weakened; Mosca does not apply (no algorithm identified); evidence declared, unverified (use not proven). ACCEPT because it is Low risk (14.3) with no algorithm identified (a library or package name only); not verified: MOX has not found a call into it",
    "recommendations": [
      "Verify usage first: search for calls into this library",
      "Re-assess at next scan"
    ],
    "replacements": [
      {
        "from": "OpenSSL 1.1.1k",
        "to": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 5,
    "wave_reason": "accepted risk: validate at the next scan and attest",
    "priority": "P4",
    "priority_reason": "No identified algorithm: library or package name only",
    "verify_first": true,
    "id": 259,
    "fix_finding": null,
    "primary_location": "Dockerfile:2",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "containers"
    ],
    "files": [
      "Dockerfile"
    ]
  },
  {
    "key": "dependencies:package.json:5:node-forge",
    "fingerprint": null,
    "label": "node-forge package.json:5",
    "algorithm": "node-forge",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 14.3,
    "tier": "Low",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 15,
          "basis": "unknown",
          "citation": []
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 0,
          "basis": "none",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 2,
          "basis": "unverified"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 17
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.7,
          "basis": "low"
        }
      ],
      "exact": 14.28,
      "base_status": "unknown",
      "quantum": "none",
      "quantum_vulnerable": false,
      "evidence": "unverified",
      "evidence_label": "Declared, unverified",
      "confidence": "low",
      "criticality": 3,
      "threats": [],
      "purposes": [],
      "mosca": {
        "applies": false,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 3,
        "y_basis": "CMCS 6 / 2, rounded up",
        "z": 10,
        "exposure": null,
        "reason": "no algorithm identified: only a library or package name was found"
      },
      "cmcs": {
        "score": 6,
        "basis": "library dependency",
        "components": [
          {
            "term": "location",
            "value": 5,
            "basis": "library dependency"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 1,
            "basis": "a vendor or upstream release controls it"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "ACCEPT",
    "reason": "node-forge is unrated (no NIST rule matches its name or key size); not quantum-weakened; Mosca does not apply (no algorithm identified); evidence declared, unverified (use not proven). ACCEPT because it is Low risk (14.3) with no algorithm identified (a library or package name only); not verified: MOX has not found a call into it",
    "recommendations": [
      "Verify usage first: search for calls into this library",
      "Re-assess at next scan"
    ],
    "replacements": [
      {
        "from": "node-forge",
        "to": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 5,
    "wave_reason": "accepted risk: validate at the next scan and attest",
    "priority": "P4",
    "priority_reason": "No identified algorithm: library or package name only",
    "verify_first": true,
    "id": 260,
    "fix_finding": null,
    "primary_location": "package.json:5",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "dependencies"
    ],
    "files": [
      "package.json"
    ]
  },
  {
    "key": "dependencies:package.json:6:jsonwebtoken",
    "fingerprint": null,
    "label": "jsonwebtoken package.json:6",
    "algorithm": "jsonwebtoken",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 14.3,
    "tier": "Low",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 15,
          "basis": "unknown",
          "citation": []
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 0,
          "basis": "none",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 2,
          "basis": "unverified"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 17
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.7,
          "basis": "low"
        }
      ],
      "exact": 14.28,
      "base_status": "unknown",
      "quantum": "none",
      "quantum_vulnerable": false,
      "evidence": "unverified",
      "evidence_label": "Declared, unverified",
      "confidence": "low",
      "criticality": 3,
      "threats": [],
      "purposes": [],
      "mosca": {
        "applies": false,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 3,
        "y_basis": "CMCS 6 / 2, rounded up",
        "z": 10,
        "exposure": null,
        "reason": "no algorithm identified: only a library or package name was found"
      },
      "cmcs": {
        "score": 6,
        "basis": "library dependency",
        "components": [
          {
            "term": "location",
            "value": 5,
            "basis": "library dependency"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 1,
            "basis": "a vendor or upstream release controls it"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "ACCEPT",
    "reason": "jsonwebtoken is unrated (no NIST rule matches its name or key size); not quantum-weakened; Mosca does not apply (no algorithm identified); evidence declared, unverified (use not proven). ACCEPT because it is Low risk (14.3) with no algorithm identified (a library or package name only); not verified: MOX has not found a call into it",
    "recommendations": [
      "Verify usage first: search for calls into this library",
      "Re-assess at next scan"
    ],
    "replacements": [
      {
        "from": "jsonwebtoken",
        "to": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 5,
    "wave_reason": "accepted risk: validate at the next scan and attest",
    "priority": "P4",
    "priority_reason": "No identified algorithm: library or package name only",
    "verify_first": true,
    "id": 261,
    "fix_finding": null,
    "primary_location": "package.json:6",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "dependencies"
    ],
    "files": [
      "package.json"
    ]
  },
  {
    "key": "dependencies:pom.xml:9:bcprov-jdk15on",
    "fingerprint": null,
    "label": "bcprov-jdk15on pom.xml:9",
    "algorithm": "bcprov-jdk15on",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 14.3,
    "tier": "Low",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 15,
          "basis": "unknown",
          "citation": []
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 0,
          "basis": "none",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 2,
          "basis": "unverified"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 17
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.7,
          "basis": "low"
        }
      ],
      "exact": 14.28,
      "base_status": "unknown",
      "quantum": "none",
      "quantum_vulnerable": false,
      "evidence": "unverified",
      "evidence_label": "Declared, unverified",
      "confidence": "low",
      "criticality": 3,
      "threats": [],
      "purposes": [],
      "mosca": {
        "applies": false,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 3,
        "y_basis": "CMCS 6 / 2, rounded up",
        "z": 10,
        "exposure": null,
        "reason": "no algorithm identified: only a library or package name was found"
      },
      "cmcs": {
        "score": 6,
        "basis": "library dependency",
        "components": [
          {
            "term": "location",
            "value": 5,
            "basis": "library dependency"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 1,
            "basis": "a vendor or upstream release controls it"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "ACCEPT",
    "reason": "bcprov-jdk15on is unrated (no NIST rule matches its name or key size); not quantum-weakened; Mosca does not apply (no algorithm identified); evidence declared, unverified (use not proven). ACCEPT because it is Low risk (14.3) with no algorithm identified (a library or package name only); not verified: MOX has not found a call into it",
    "recommendations": [
      "Verify usage first: search for calls into this library",
      "Re-assess at next scan"
    ],
    "replacements": [
      {
        "from": "bcprov-jdk15on",
        "to": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 5,
    "wave_reason": "accepted risk: validate at the next scan and attest",
    "priority": "P4",
    "priority_reason": "No identified algorithm: library or package name only",
    "verify_first": true,
    "id": 262,
    "fix_finding": null,
    "primary_location": "pom.xml:9",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "dependencies"
    ],
    "files": [
      "pom.xml"
    ]
  },
  {
    "key": "dependencies:requirements.txt:1:pycryptodome",
    "fingerprint": null,
    "label": "pycryptodome requirements.txt:1",
    "algorithm": "pycryptodome",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 14.3,
    "tier": "Low",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 15,
          "basis": "unknown",
          "citation": []
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 0,
          "basis": "none",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 2,
          "basis": "unverified"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 17
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.7,
          "basis": "low"
        }
      ],
      "exact": 14.28,
      "base_status": "unknown",
      "quantum": "none",
      "quantum_vulnerable": false,
      "evidence": "unverified",
      "evidence_label": "Declared, unverified",
      "confidence": "low",
      "criticality": 3,
      "threats": [],
      "purposes": [],
      "mosca": {
        "applies": false,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 3,
        "y_basis": "CMCS 6 / 2, rounded up",
        "z": 10,
        "exposure": null,
        "reason": "no algorithm identified: only a library or package name was found"
      },
      "cmcs": {
        "score": 6,
        "basis": "library dependency",
        "components": [
          {
            "term": "location",
            "value": 5,
            "basis": "library dependency"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 1,
            "basis": "a vendor or upstream release controls it"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "ACCEPT",
    "reason": "pycryptodome is unrated (no NIST rule matches its name or key size); not quantum-weakened; Mosca does not apply (no algorithm identified); evidence declared, unverified (use not proven). ACCEPT because it is Low risk (14.3) with no algorithm identified (a library or package name only); not verified: MOX has not found a call into it",
    "recommendations": [
      "Verify usage first: search for calls into this library",
      "Re-assess at next scan"
    ],
    "replacements": [
      {
        "from": "pycryptodome",
        "to": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 5,
    "wave_reason": "accepted risk: validate at the next scan and attest",
    "priority": "P4",
    "priority_reason": "No identified algorithm: library or package name only",
    "verify_first": true,
    "id": 263,
    "fix_finding": null,
    "primary_location": "requirements.txt:1",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "dependencies"
    ],
    "files": [
      "requirements.txt"
    ]
  },
  {
    "key": "dependencies:requirements.txt:2:cryptography",
    "fingerprint": null,
    "label": "cryptography requirements.txt:2",
    "algorithm": "cryptography",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 14.3,
    "tier": "Low",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 15,
          "basis": "unknown",
          "citation": []
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 0,
          "basis": "none",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 2,
          "basis": "unverified"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 17
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.7,
          "basis": "low"
        }
      ],
      "exact": 14.28,
      "base_status": "unknown",
      "quantum": "none",
      "quantum_vulnerable": false,
      "evidence": "unverified",
      "evidence_label": "Declared, unverified",
      "confidence": "low",
      "criticality": 3,
      "threats": [],
      "purposes": [],
      "mosca": {
        "applies": false,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 3,
        "y_basis": "CMCS 6 / 2, rounded up",
        "z": 10,
        "exposure": null,
        "reason": "no algorithm identified: only a library or package name was found"
      },
      "cmcs": {
        "score": 6,
        "basis": "library dependency",
        "components": [
          {
            "term": "location",
            "value": 5,
            "basis": "library dependency"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 1,
            "basis": "a vendor or upstream release controls it"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "ACCEPT",
    "reason": "cryptography is unrated (no NIST rule matches its name or key size); not quantum-weakened; Mosca does not apply (no algorithm identified); evidence declared, unverified (use not proven). ACCEPT because it is Low risk (14.3) with no algorithm identified (a library or package name only); not verified: MOX has not found a call into it",
    "recommendations": [
      "Verify usage first: search for calls into this library",
      "Re-assess at next scan"
    ],
    "replacements": [
      {
        "from": "cryptography",
        "to": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 5,
    "wave_reason": "accepted risk: validate at the next scan and attest",
    "priority": "P4",
    "priority_reason": "No identified algorithm: library or package name only",
    "verify_first": true,
    "id": 264,
    "fix_finding": null,
    "primary_location": "requirements.txt:2",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "dependencies"
    ],
    "files": [
      "requirements.txt"
    ]
  },
  {
    "key": "binaries:vendor/sync-agent.bin:0:OpenSSL 1.1.1k",
    "fingerprint": null,
    "label": "OpenSSL 1.1.1k vendor/sync-agent.bin:0",
    "algorithm": "OpenSSL 1.1.1k",
    "key_size": null,
    "hybrid": false,
    "hybrid_ineffective": [],
    "summary": "1 finding \u2192 1 asset",
    "score": 12.6,
    "tier": "Low",
    "priority_override": null,
    "owner": null,
    "status": null,
    "notes": null,
    "edited": false,
    "breakdown": {
      "terms": [
        {
          "term": "base",
          "op": "+",
          "value": 15,
          "basis": "unknown",
          "citation": []
        },
        {
          "term": "quantum",
          "op": "+",
          "value": 0,
          "basis": "none",
          "note": null
        },
        {
          "term": "evidence",
          "op": "+",
          "value": 0,
          "basis": "textual"
        },
        {
          "term": "subtotal",
          "op": "=",
          "value": 15
        },
        {
          "term": "criticality",
          "op": "\u00d7",
          "value": 1.2,
          "basis": 3
        },
        {
          "term": "confidence",
          "op": "\u00d7",
          "value": 0.7,
          "basis": "low"
        }
      ],
      "exact": 12.6,
      "base_status": "unknown",
      "quantum": "none",
      "quantum_vulnerable": false,
      "evidence": "textual",
      "evidence_label": "Textual",
      "confidence": "low",
      "criticality": 3,
      "threats": [],
      "purposes": [],
      "mosca": {
        "applies": false,
        "x": 5,
        "x_basis": "project default shelf life",
        "y": 5,
        "y_basis": "CMCS 9 / 2, rounded up",
        "z": 10,
        "exposure": null,
        "reason": "no algorithm identified: only a library or package name was found"
      },
      "cmcs": {
        "score": 9,
        "basis": "compiled into a binary",
        "components": [
          {
            "term": "location",
            "value": 8,
            "basis": "compiled into a binary"
          },
          {
            "term": "spread",
            "value": 0,
            "basis": "1 file"
          },
          {
            "term": "vendor",
            "value": 1,
            "basis": "a vendor or upstream release controls it"
          },
          {
            "term": "renegotiation",
            "value": 0,
            "basis": "one side can change alone"
          }
        ],
        "clamped": false
      }
    },
    "verdict": "CONTAIN",
    "reason": "OpenSSL 1.1.1k is unrated (no NIST rule matches its name or key size); not quantum-weakened; Mosca does not apply (no algorithm identified); evidence textual (a string match, not a parsed artefact). CONTAIN because migration takes Y = 5 yrs (CMCS 9: compiled into a binary), too long to patch in place",
    "recommendations": [
      "Segment the network path to this asset",
      "Front it with a crypto-agile gateway",
      "Shorten key lifetime / rotate more often"
    ],
    "replacements": [
      {
        "from": "OpenSSL 1.1.1k",
        "to": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first",
        "note": null
      }
    ],
    "size_notes": [],
    "wave": 4,
    "wave_reason": "Low risk tier; Mosca does not apply (no identified algorithm), so one wave after its tier",
    "priority": "P3",
    "priority_reason": "Planned contain (Wave 4)",
    "verify_first": true,
    "id": 276,
    "fix_finding": null,
    "primary_location": "vendor/sync-agent.bin",
    "locations_count": 1,
    "findings_count": 1,
    "planes": [
      "binaries"
    ],
    "files": [
      "vendor/sync-agent.bin"
    ]
  }
];

export const DEMO_CBOM = {
  "valid": true,
  "errors": [],
  "version": 1,
  "spec": "1.6",
  "components": 26,
  "bom": {
    "bomFormat": "CycloneDX",
    "specVersion": "1.6",
    "serialNumber": "urn:uuid:4f2fd1ea-c0e6-4b01-854e-970d23a62745",
    "version": 1,
    "metadata": {
      "timestamp": "2026-09-28T17:40:00+00:00",
      "tools": {
        "components": [
          {
            "type": "application",
            "name": "MOX",
            "version": "0.4.0"
          }
        ]
      },
      "component": {
        "type": "application",
        "bom-ref": "mox-target",
        "name": "demo_target"
      }
    },
    "components": [
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-255",
        "name": "RSA-2048 api-gw.key",
        "cryptoProperties": {
          "assetType": "related-crypto-material",
          "relatedCryptoMaterialProperties": {
            "type": "private-key",
            "size": 2048
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "approved"
          },
          {
            "name": "mox:nist_2030",
            "value": "deprecated"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "75.6"
          },
          {
            "name": "mox:tier",
            "value": "Critical"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "1"
          },
          {
            "name": "mox:confidence",
            "value": "high"
          },
          {
            "name": "mox:evidence",
            "value": "observed"
          },
          {
            "name": "mox:locations",
            "value": "8"
          },
          {
            "name": "mox:status",
            "value": "Open"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-258",
        "name": "RSA-1024 legacy-portal.crt",
        "cryptoProperties": {
          "assetType": "certificate",
          "certificateProperties": {
            "certificateFormat": "X.509"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "disallowed"
          },
          {
            "name": "mox:nist_2030",
            "value": "disallowed"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "75.6"
          },
          {
            "name": "mox:tier",
            "value": "Critical"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "1"
          },
          {
            "name": "mox:confidence",
            "value": "high"
          },
          {
            "name": "mox:evidence",
            "value": "observed"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-267",
        "name": "DES conf/java.security:3",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "block-cipher"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "disallowed"
          },
          {
            "name": "mox:nist_2030",
            "value": "disallowed"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "52.0"
          },
          {
            "name": "mox:tier",
            "value": "High"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "1"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-268",
        "name": "3DES conf/java.security:3",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "block-cipher"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "disallowed"
          },
          {
            "name": "mox:nist_2030",
            "value": "disallowed"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "52.0"
          },
          {
            "name": "mox:tier",
            "value": "High"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "1"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-273",
        "name": "DES payments/Crypto.java:16",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "block-cipher",
            "mode": "cbc"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "disallowed"
          },
          {
            "name": "mox:nist_2030",
            "value": "disallowed"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "52.0"
          },
          {
            "name": "mox:tier",
            "value": "Critical"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "1"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          },
          {
            "name": "mox:priorityOverride",
            "value": "P1"
          },
          {
            "name": "mox:owner",
            "value": "Alice"
          },
          {
            "name": "mox:status",
            "value": "In progress"
          },
          {
            "name": "mox:note",
            "value": "Test note"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-265",
        "name": "MD5 auth/passwords.py:5",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "hash"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "not_approved"
          },
          {
            "name": "mox:nist_2030",
            "value": "not_approved"
          },
          {
            "name": "mox:nist_2035",
            "value": "not_approved"
          },
          {
            "name": "mox:score",
            "value": "36.7"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "2"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-269",
        "name": "RC4 conf/java.security:3",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "stream-cipher"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "not_approved"
          },
          {
            "name": "mox:nist_2030",
            "value": "not_approved"
          },
          {
            "name": "mox:nist_2035",
            "value": "not_approved"
          },
          {
            "name": "mox:score",
            "value": "36.7"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "4"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-271",
        "name": "SHA-1 payments/Crypto.java:6",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "hash"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "deprecated"
          },
          {
            "name": "mox:nist_2030",
            "value": "disallowed"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "36.7"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "2"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-275",
        "name": "AES utils/legacy_aes.py:5",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "block-cipher",
            "mode": "ecb"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "deprecated"
          },
          {
            "name": "mox:nist_2030",
            "value": "disallowed"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "36.7"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "4"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-279",
        "name": "MD5 web/sign.js:4",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "hash"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "not_approved"
          },
          {
            "name": "mox:nist_2030",
            "value": "not_approved"
          },
          {
            "name": "mox:nist_2035",
            "value": "not_approved"
          },
          {
            "name": "mox:score",
            "value": "36.7"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "4"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-266",
        "name": "RSA auth/token_signer.py:10",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "pke",
            "nistQuantumSecurityLevel": 0
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2030",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2035",
            "value": "unknown"
          },
          {
            "name": "mox:score",
            "value": "34.7"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "2"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-280",
        "name": "RSA web/sign.js:8",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "pke",
            "nistQuantumSecurityLevel": 0
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2030",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2035",
            "value": "unknown"
          },
          {
            "name": "mox:score",
            "value": "34.7"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "4"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-256",
        "name": "ECDSA-256 ecdsa-p256.crt",
        "cryptoProperties": {
          "assetType": "certificate",
          "certificateProperties": {
            "certificateFormat": "X.509"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "approved"
          },
          {
            "name": "mox:nist_2030",
            "value": "approved"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "33.6"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "4"
          },
          {
            "name": "mox:confidence",
            "value": "high"
          },
          {
            "name": "mox:evidence",
            "value": "observed"
          },
          {
            "name": "mox:locations",
            "value": "3"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-257",
        "name": "RSA-4096 internal-ca.crt",
        "cryptoProperties": {
          "assetType": "certificate",
          "certificateProperties": {
            "certificateFormat": "X.509"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "approved"
          },
          {
            "name": "mox:nist_2030",
            "value": "approved"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "33.6"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "4"
          },
          {
            "name": "mox:confidence",
            "value": "high"
          },
          {
            "name": "mox:evidence",
            "value": "observed"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-278",
        "name": "MD5 vendor/sync-agent.bin:0",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "hash"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "not_approved"
          },
          {
            "name": "mox:nist_2030",
            "value": "not_approved"
          },
          {
            "name": "mox:nist_2035",
            "value": "not_approved"
          },
          {
            "name": "mox:score",
            "value": "26.9"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "CONTAIN"
          },
          {
            "name": "mox:wave",
            "value": "4"
          },
          {
            "name": "mox:confidence",
            "value": "low"
          },
          {
            "name": "mox:evidence",
            "value": "textual"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-277",
        "name": "RSA vendor/sync-agent.bin:0",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "pke",
            "nistQuantumSecurityLevel": 0
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2030",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2035",
            "value": "unknown"
          },
          {
            "name": "mox:score",
            "value": "25.2"
          },
          {
            "name": "mox:tier",
            "value": "Medium"
          },
          {
            "name": "mox:verdict",
            "value": "CONTAIN"
          },
          {
            "name": "mox:wave",
            "value": "4"
          },
          {
            "name": "mox:confidence",
            "value": "low"
          },
          {
            "name": "mox:evidence",
            "value": "textual"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-270",
        "name": "RSA-2048 infra/kms.tf:4",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "pke",
            "parameterSetIdentifier": "2048",
            "nistQuantumSecurityLevel": 0
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "approved"
          },
          {
            "name": "mox:nist_2030",
            "value": "deprecated"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "24.5"
          },
          {
            "name": "mox:tier",
            "value": "Low"
          },
          {
            "name": "mox:verdict",
            "value": "CONTAIN"
          },
          {
            "name": "mox:wave",
            "value": "4"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-272",
        "name": "RSA-2048 payments/Crypto.java:11",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "pke",
            "parameterSetIdentifier": "2048",
            "nistQuantumSecurityLevel": 0
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "approved"
          },
          {
            "name": "mox:nist_2030",
            "value": "deprecated"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "24.5"
          },
          {
            "name": "mox:tier",
            "value": "Low"
          },
          {
            "name": "mox:verdict",
            "value": "MIGRATE"
          },
          {
            "name": "mox:wave",
            "value": "2"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-274",
        "name": "ECDSA-256 services/ecdsa.go:10",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "signature",
            "parameterSetIdentifier": "256",
            "curve": "P-256",
            "nistQuantumSecurityLevel": 0
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "approved"
          },
          {
            "name": "mox:nist_2030",
            "value": "approved"
          },
          {
            "name": "mox:nist_2035",
            "value": "disallowed"
          },
          {
            "name": "mox:score",
            "value": "24.5"
          },
          {
            "name": "mox:tier",
            "value": "Low"
          },
          {
            "name": "mox:verdict",
            "value": "ACCEPT"
          },
          {
            "name": "mox:wave",
            "value": "5"
          },
          {
            "name": "mox:confidence",
            "value": "medium"
          },
          {
            "name": "mox:evidence",
            "value": "declared"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-259",
        "name": "OpenSSL 1.1.1k Dockerfile:2",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "other"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2030",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2035",
            "value": "unknown"
          },
          {
            "name": "mox:score",
            "value": "14.3"
          },
          {
            "name": "mox:tier",
            "value": "Low"
          },
          {
            "name": "mox:verdict",
            "value": "ACCEPT"
          },
          {
            "name": "mox:wave",
            "value": "5"
          },
          {
            "name": "mox:confidence",
            "value": "low"
          },
          {
            "name": "mox:evidence",
            "value": "unverified"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-260",
        "name": "node-forge package.json:5",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "other"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2030",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2035",
            "value": "unknown"
          },
          {
            "name": "mox:score",
            "value": "14.3"
          },
          {
            "name": "mox:tier",
            "value": "Low"
          },
          {
            "name": "mox:verdict",
            "value": "ACCEPT"
          },
          {
            "name": "mox:wave",
            "value": "5"
          },
          {
            "name": "mox:confidence",
            "value": "low"
          },
          {
            "name": "mox:evidence",
            "value": "unverified"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-261",
        "name": "jsonwebtoken package.json:6",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "other"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2030",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2035",
            "value": "unknown"
          },
          {
            "name": "mox:score",
            "value": "14.3"
          },
          {
            "name": "mox:tier",
            "value": "Low"
          },
          {
            "name": "mox:verdict",
            "value": "ACCEPT"
          },
          {
            "name": "mox:wave",
            "value": "5"
          },
          {
            "name": "mox:confidence",
            "value": "low"
          },
          {
            "name": "mox:evidence",
            "value": "unverified"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-262",
        "name": "bcprov-jdk15on pom.xml:9",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "other"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2030",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2035",
            "value": "unknown"
          },
          {
            "name": "mox:score",
            "value": "14.3"
          },
          {
            "name": "mox:tier",
            "value": "Low"
          },
          {
            "name": "mox:verdict",
            "value": "ACCEPT"
          },
          {
            "name": "mox:wave",
            "value": "5"
          },
          {
            "name": "mox:confidence",
            "value": "low"
          },
          {
            "name": "mox:evidence",
            "value": "unverified"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-263",
        "name": "pycryptodome requirements.txt:1",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "other"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2030",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2035",
            "value": "unknown"
          },
          {
            "name": "mox:score",
            "value": "14.3"
          },
          {
            "name": "mox:tier",
            "value": "Low"
          },
          {
            "name": "mox:verdict",
            "value": "ACCEPT"
          },
          {
            "name": "mox:wave",
            "value": "5"
          },
          {
            "name": "mox:confidence",
            "value": "low"
          },
          {
            "name": "mox:evidence",
            "value": "unverified"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-264",
        "name": "cryptography requirements.txt:2",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "other"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2030",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2035",
            "value": "unknown"
          },
          {
            "name": "mox:score",
            "value": "14.3"
          },
          {
            "name": "mox:tier",
            "value": "Low"
          },
          {
            "name": "mox:verdict",
            "value": "ACCEPT"
          },
          {
            "name": "mox:wave",
            "value": "5"
          },
          {
            "name": "mox:confidence",
            "value": "low"
          },
          {
            "name": "mox:evidence",
            "value": "unverified"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      },
      {
        "type": "cryptographic-asset",
        "bom-ref": "mox-asset-276",
        "name": "OpenSSL 1.1.1k vendor/sync-agent.bin:0",
        "cryptoProperties": {
          "assetType": "algorithm",
          "algorithmProperties": {
            "primitive": "other"
          }
        },
        "properties": [
          {
            "name": "mox:nist_now",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2030",
            "value": "unknown"
          },
          {
            "name": "mox:nist_2035",
            "value": "unknown"
          },
          {
            "name": "mox:score",
            "value": "12.6"
          },
          {
            "name": "mox:tier",
            "value": "Low"
          },
          {
            "name": "mox:verdict",
            "value": "CONTAIN"
          },
          {
            "name": "mox:wave",
            "value": "4"
          },
          {
            "name": "mox:confidence",
            "value": "low"
          },
          {
            "name": "mox:evidence",
            "value": "textual"
          },
          {
            "name": "mox:locations",
            "value": "1"
          }
        ]
      }
    ]
  }
};

export const DEMO_ROADMAP = [
  {
    "wave": 1,
    "name": "Act now",
    "goal": "Critical assets: act first",
    "count": 5,
    "assets": [
      {
        "id": 255,
        "label": "RSA-2048 api-gw.key",
        "tier": "Critical",
        "verdict": "MIGRATE",
        "score": 75.6,
        "replacement": "ML-DSA-65 (hybrid first)"
      },
      {
        "id": 258,
        "label": "RSA-1024 legacy-portal.crt",
        "tier": "Critical",
        "verdict": "MIGRATE",
        "score": 75.6,
        "replacement": "ML-DSA-65 (hybrid first)"
      },
      {
        "id": 267,
        "label": "DES conf/java.security:3",
        "tier": "High",
        "verdict": "MIGRATE",
        "score": 52.0,
        "replacement": "AES-256-GCM"
      },
      {
        "id": 268,
        "label": "3DES conf/java.security:3",
        "tier": "High",
        "verdict": "MIGRATE",
        "score": 52.0,
        "replacement": "AES-256-GCM"
      },
      {
        "id": 273,
        "label": "DES payments/Crypto.java:16",
        "tier": "Critical",
        "verdict": "MIGRATE",
        "score": 52.0,
        "replacement": "AES-256-GCM"
      }
    ]
  },
  {
    "wave": 2,
    "name": "Plan",
    "goal": "High exposure: plan and prepare",
    "count": 4,
    "assets": [
      {
        "id": 265,
        "label": "MD5 auth/passwords.py:5",
        "tier": "Medium",
        "verdict": "MIGRATE",
        "score": 36.7,
        "replacement": "SHA-256"
      },
      {
        "id": 271,
        "label": "SHA-1 payments/Crypto.java:6",
        "tier": "Medium",
        "verdict": "MIGRATE",
        "score": 36.7,
        "replacement": "SHA-256"
      },
      {
        "id": 266,
        "label": "RSA auth/token_signer.py:10",
        "tier": "Medium",
        "verdict": "MIGRATE",
        "score": 34.7,
        "replacement": "ML-DSA-65 (hybrid first)"
      },
      {
        "id": 272,
        "label": "RSA-2048 payments/Crypto.java:11",
        "tier": "Low",
        "verdict": "MIGRATE",
        "score": 24.5,
        "replacement": "ML-DSA-65 (hybrid first)"
      }
    ]
  },
  {
    "wave": 3,
    "name": "Engineer agility",
    "goal": "Medium: engineer crypto-agility",
    "count": 0,
    "assets": []
  },
  {
    "wave": 4,
    "name": "Hybrid deploy",
    "goal": "Low: deploy hybrid PQC",
    "count": 10,
    "assets": [
      {
        "id": 269,
        "label": "RC4 conf/java.security:3",
        "tier": "Medium",
        "verdict": "MIGRATE",
        "score": 36.7,
        "replacement": "AES-256-GCM"
      },
      {
        "id": 275,
        "label": "AES utils/legacy_aes.py:5",
        "tier": "Medium",
        "verdict": "MIGRATE",
        "score": 36.7,
        "replacement": "AES-256-GCM"
      },
      {
        "id": 279,
        "label": "MD5 web/sign.js:4",
        "tier": "Medium",
        "verdict": "MIGRATE",
        "score": 36.7,
        "replacement": "SHA-256"
      },
      {
        "id": 280,
        "label": "RSA web/sign.js:8",
        "tier": "Medium",
        "verdict": "MIGRATE",
        "score": 34.7,
        "replacement": "ML-DSA-65 (hybrid first)"
      },
      {
        "id": 256,
        "label": "ECDSA-256 ecdsa-p256.crt",
        "tier": "Medium",
        "verdict": "MIGRATE",
        "score": 33.6,
        "replacement": "ML-DSA-65 (hybrid first)"
      },
      {
        "id": 257,
        "label": "RSA-4096 internal-ca.crt",
        "tier": "Medium",
        "verdict": "MIGRATE",
        "score": 33.6,
        "replacement": "ML-DSA-65 (hybrid first)"
      },
      {
        "id": 278,
        "label": "MD5 vendor/sync-agent.bin:0",
        "tier": "Medium",
        "verdict": "CONTAIN",
        "score": 26.9,
        "replacement": "SHA-256"
      },
      {
        "id": 277,
        "label": "RSA vendor/sync-agent.bin:0",
        "tier": "Medium",
        "verdict": "CONTAIN",
        "score": 25.2,
        "replacement": "ML-DSA-65 (hybrid first)"
      },
      {
        "id": 270,
        "label": "RSA-2048 infra/kms.tf:4",
        "tier": "Low",
        "verdict": "CONTAIN",
        "score": 24.5,
        "replacement": "ML-DSA-65 (hybrid first)"
      },
      {
        "id": 276,
        "label": "OpenSSL 1.1.1k vendor/sync-agent.bin:0",
        "tier": "Low",
        "verdict": "CONTAIN",
        "score": 12.6,
        "replacement": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first"
      }
    ]
  },
  {
    "wave": 5,
    "name": "Validate & attest",
    "goal": "Accepted / monitored: validate and attest",
    "count": 7,
    "assets": [
      {
        "id": 274,
        "label": "ECDSA-256 services/ecdsa.go:10",
        "tier": "Low",
        "verdict": "ACCEPT",
        "score": 24.5,
        "replacement": "ML-DSA-65 (hybrid first)"
      },
      {
        "id": 259,
        "label": "OpenSSL 1.1.1k Dockerfile:2",
        "tier": "Low",
        "verdict": "ACCEPT",
        "score": 14.3,
        "replacement": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first"
      },
      {
        "id": 260,
        "label": "node-forge package.json:5",
        "tier": "Low",
        "verdict": "ACCEPT",
        "score": 14.3,
        "replacement": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first"
      },
      {
        "id": 261,
        "label": "jsonwebtoken package.json:6",
        "tier": "Low",
        "verdict": "ACCEPT",
        "score": 14.3,
        "replacement": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first"
      },
      {
        "id": 262,
        "label": "bcprov-jdk15on pom.xml:9",
        "tier": "Low",
        "verdict": "ACCEPT",
        "score": 14.3,
        "replacement": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first"
      },
      {
        "id": 263,
        "label": "pycryptodome requirements.txt:1",
        "tier": "Low",
        "verdict": "ACCEPT",
        "score": 14.3,
        "replacement": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first"
      },
      {
        "id": 264,
        "label": "cryptography requirements.txt:2",
        "tier": "Low",
        "verdict": "ACCEPT",
        "score": 14.3,
        "replacement": "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first"
      }
    ]
  }
];

export const DEMO_FILES = {
  "auth/passwords.py": {
    "path": "auth/passwords.py",
    "resolved_path": "demo_target/auth/passwords.py",
    "line": 1,
    "lines": [
      "import hashlib",
      "",
      "",
      "def hash_password(pw: str) -> str:",
      "    return hashlib.md5(pw.encode()).hexdigest()"
    ],
    "total_lines": 5,
    "content": "import hashlib\n\n\ndef hash_password(pw: str) -> str:\n    return hashlib.md5(pw.encode()).hexdigest()\n",
    "is_binary": false
  },
  "auth/token_signer.py": {
    "path": "auth/token_signer.py",
    "resolved_path": "demo_target/auth/token_signer.py",
    "line": 1,
    "lines": [
      "from cryptography.hazmat.primitives import hashes, serialization",
      "from cryptography.hazmat.primitives.asymmetric import padding",
      "",
      "KEY_PATH = \"certs/api-gw.key\"",
      "",
      "",
      "def sign(payload: bytes) -> bytes:",
      "    with open(KEY_PATH, \"rb\") as f:",
      "        key = serialization.load_pem_private_key(f.read(), password=None)",
      "    return key.sign(payload, padding.PKCS1v15(), hashes.SHA256())"
    ],
    "total_lines": 10,
    "content": "from cryptography.hazmat.primitives import hashes, serialization\nfrom cryptography.hazmat.primitives.asymmetric import padding\n\nKEY_PATH = \"certs/api-gw.key\"\n\n\ndef sign(payload: bytes) -> bytes:\n    with open(KEY_PATH, \"rb\") as f:\n        key = serialization.load_pem_private_key(f.read(), password=None)\n    return key.sign(payload, padding.PKCS1v15(), hashes.SHA256())\n",
    "is_binary": false
  },
  "certs/api-gw.crt": {
    "path": "certs/api-gw.crt",
    "resolved_path": "demo_target/certs/api-gw.crt",
    "line": 1,
    "lines": [
      "-----BEGIN CERTIFICATE-----",
      "MIIDFjCCAf6gAwIBAgIUBEDLf0BwjyG4/1Y5CnohV4b5JpEwDQYJKoZIhvcNAQEL",
      "BQAwRTEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMSAwHgYDVQQD",
      "DBdhcGktZ3cuZ292LXBvcnRhbC5sb2NhbDAeFw0yNjA4MjUwMjExNTdaFw0yNzA4",
      "MjUwMjExNTdaMEUxITAfBgNVBAoMGGdvdi1wb3J0YWwtbGVnYWN5IChkZW1vKTEg",
      "MB4GA1UEAwwXYXBpLWd3Lmdvdi1wb3J0YWwubG9jYWwwggEiMA0GCSqGSIb3DQEB",
      "AQUAA4IBDwAwggEKAoIBAQDVrgQTeluvbCUgNwpmhaS3ykXvtKh/tPfgaLTxZo8l",
      "BJQrJFM+aTMV08UXAwxJam3i5jKn+JuxzkQMN+AjY0DCjNiZwNnC6a9Bz+JmgieQ",
      "wFcmbvCLv82LW2wMTPqU232CTzyhogHKzjzgD82ChlCXSSeM5TnrjdDdoFktHVgc",
      "XWqJW5KXBYFOPP+JYtLTwxnNyVG7lezaVF/pamzUhII3cV+9RcN+olzSx6FUZK3U",
      "seTT3+mb7Uu6UuIOtLiOdN11p7AE8MGBTBc7GnJyMJFLYHz5b8SjfnwSckvWveLU",
      "GAMjHnQ3HYEhMMV9nWGBsgygFXdLsPSWkT9N4s/VPlhVAgMBAAEwDQYJKoZIhvcN",
      "AQELBQADggEBAClPZ9ESWkrLERI0eEZYWRRNdmt3xIjGB7S0/11gQpYmkKWrV0B/",
      "lJLIt7ingcrHXK+IcRw3/nKCdD51K7R9h20TK2Y8sn4T8DffcNugCHjYUvpSxeg7",
      "nG2P11UbT+Jg9O7X4D3j4qKNJuKRVTfb0K+KoplM5ShgqMi1urYeYRQec9bMAkng",
      "69rq/fmF1EV4NBjvOhrjd3ze/aXvb4j9wKokfbXV82uJuHN2RUnjJVo0ZNv0ZFvd",
      "kMIXJm6Mh4iYU+ezYG51eThE6V4xKU13nS2bkwJ/dJcjlAk0zQYVzzFgTwV5ddwC",
      "iyckzq3BBVvq7DYPw3nSDhZKs3crKwWTkAI=",
      "-----END CERTIFICATE-----"
    ],
    "total_lines": 19,
    "content": "-----BEGIN CERTIFICATE-----\nMIIDFjCCAf6gAwIBAgIUBEDLf0BwjyG4/1Y5CnohV4b5JpEwDQYJKoZIhvcNAQEL\nBQAwRTEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMSAwHgYDVQQD\nDBdhcGktZ3cuZ292LXBvcnRhbC5sb2NhbDAeFw0yNjA4MjUwMjExNTdaFw0yNzA4\nMjUwMjExNTdaMEUxITAfBgNVBAoMGGdvdi1wb3J0YWwtbGVnYWN5IChkZW1vKTEg\nMB4GA1UEAwwXYXBpLWd3Lmdvdi1wb3J0YWwubG9jYWwwggEiMA0GCSqGSIb3DQEB\nAQUAA4IBDwAwggEKAoIBAQDVrgQTeluvbCUgNwpmhaS3ykXvtKh/tPfgaLTxZo8l\nBJQrJFM+aTMV08UXAwxJam3i5jKn+JuxzkQMN+AjY0DCjNiZwNnC6a9Bz+JmgieQ\nwFcmbvCLv82LW2wMTPqU232CTzyhogHKzjzgD82ChlCXSSeM5TnrjdDdoFktHVgc\nXWqJW5KXBYFOPP+JYtLTwxnNyVG7lezaVF/pamzUhII3cV+9RcN+olzSx6FUZK3U\nseTT3+mb7Uu6UuIOtLiOdN11p7AE8MGBTBc7GnJyMJFLYHz5b8SjfnwSckvWveLU\nGAMjHnQ3HYEhMMV9nWGBsgygFXdLsPSWkT9N4s/VPlhVAgMBAAEwDQYJKoZIhvcN\nAQELBQADggEBAClPZ9ESWkrLERI0eEZYWRRNdmt3xIjGB7S0/11gQpYmkKWrV0B/\nlJLIt7ingcrHXK+IcRw3/nKCdD51K7R9h20TK2Y8sn4T8DffcNugCHjYUvpSxeg7\nnG2P11UbT+Jg9O7X4D3j4qKNJuKRVTfb0K+KoplM5ShgqMi1urYeYRQec9bMAkng\n69rq/fmF1EV4NBjvOhrjd3ze/aXvb4j9wKokfbXV82uJuHN2RUnjJVo0ZNv0ZFvd\nkMIXJm6Mh4iYU+ezYG51eThE6V4xKU13nS2bkwJ/dJcjlAk0zQYVzzFgTwV5ddwC\niyckzq3BBVvq7DYPw3nSDhZKs3crKwWTkAI=\n-----END CERTIFICATE-----\n",
    "is_binary": false
  },
  "certs/api-gw.key": {
    "path": "certs/api-gw.key",
    "resolved_path": "demo_target/certs/api-gw.key",
    "line": 1,
    "lines": [
      "-----BEGIN RSA PRIVATE KEY-----",
      "MIIEpAIBAAKCAQEA1a4EE3pbr2wlIDcKZoWkt8pF77Sof7T34Gi08WaPJQSUKyRT",
      "PmkzFdPFFwMMSWpt4uYyp/ibsc5EDDfgI2NAwozYmcDZwumvQc/iZoInkMBXJm7w",
      "i7/Ni1tsDEz6lNt9gk88oaIBys484A/NgoZQl0knjOU5643Q3aBZLR1YHF1qiVuS",
      "lwWBTjz/iWLS08MZzclRu5Xs2lRf6Wps1ISCN3FfvUXDfqJc0sehVGSt1LHk09/p",
      "m+1LulLiDrS4jnTddaewBPDBgUwXOxpycjCRS2B8+W/Eo358EnJL1r3i1BgDIx50",
      "Nx2BITDFfZ1hgbIMoBV3S7D0lpE/TeLP1T5YVQIDAQABAoIBABupX1W2LVBUS6oT",
      "9gC3pE82nD8fwABoSP6AD4yAnl9IbHX5Sd12eOqGc6k698g5QuhwrHYaNO2bqit6",
      "wEVUf/mvigq9cHNPFSUL6F8k0kJm4+FR00oEFnPH7gDZpkbG80R/RXYXJuw+LptC",
      "8HPJN32eNsSCmDDqNvO54lF4zwM8yAVlh6lj9/HVkU+Vynxq4YkAgPpr03ctVQMD",
      "ekKU3F0SwIWXtQpnTI23YBGikHNr+0CZE627laUGOJbRJ3f+emZD4bq+QqdFvPMJ",
      "mpDBsMcW7ZOLzllu0BQ1lhO+L5SbbBJ4GJIPZENGylYhXIDOwr9O+wxTAMwbzQaK",
      "cCmH+oECgYEA9CpBev1BctZEIRWFHgCX8QCPA+ZxybFhSH3QJK1fn5XWjg9zAAbN",
      "0/KEGJjC2tO1PnyEatMLJfJYD37z244SCt9O03rx9chmTr6v1Hqqlaei3GLxFMUg",
      "XkQsWOizJ7ow5/0qEHigPsO5eSF6gyp1aI5SR0deV1YmIlUcQbgkF90CgYEA4Al6",
      "+wchEwAxvk/s2g3JVdNSYkNQYGJBx967zCJXuxrP4MF9eLFFqPN092HfzMnQopUG",
      "J1CR5v/802AGb9snAUZgWEu3LgtxbH2qx6g3mpM2yavREP4yYNKRb8/cCo6G47Df",
      "aszafRB9SNT2u/9FOU9jCoA3qjFvD92igXD7ttkCgYEAkYiKRRulIiTSsQGZubtS",
      "1WSm2gVGd5jRypqrMOFiKMXv//b3beGgV5+q2tpa8oHT+y3O47ltYK3ljT73bTtu",
      "R6q42lbi18QeLvt75GNFQDSOX1xeJConU+jAojH5b0mMkwqUQwMTSLXy3F93Ha12",
      "E98Y7cF9WwNPcZFXaVivssUCgYB+pr1gVgprjGuSk+po5uxP2ZQ0OqugoUtgq1jt",
      "MOj5vFGSVLAS39xqg583DpyPT/PjRW3iIdkphsOt1xYse+7T+K4UnFEk9ZEcbPpz",
      "vnQYrWqGndwlyB5AwCk51X8mdKZq552V6dMGaqD44HPPmaLPoEJ0OEG/tAx+IqRw",
      "mqeiGQKBgQDHUnmGulbMTDKJHJELOR4pltJQBanhLyJqcB3pX2khcqDI1dO3Fgo6",
      "3/q2dIM0T2WQEuhp1ubTYm6igUKJdzkjTqo0U8FNsvYQRutKDMR9YoBRVuK5Sgcw",
      "LULvmMD5lWiykOQHJR7rXK6Ozv5PsbMieEGQgsA4y+svKIrwyM2+Vw==",
      "-----END RSA PRIVATE KEY-----"
    ],
    "total_lines": 27,
    "content": "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA1a4EE3pbr2wlIDcKZoWkt8pF77Sof7T34Gi08WaPJQSUKyRT\nPmkzFdPFFwMMSWpt4uYyp/ibsc5EDDfgI2NAwozYmcDZwumvQc/iZoInkMBXJm7w\ni7/Ni1tsDEz6lNt9gk88oaIBys484A/NgoZQl0knjOU5643Q3aBZLR1YHF1qiVuS\nlwWBTjz/iWLS08MZzclRu5Xs2lRf6Wps1ISCN3FfvUXDfqJc0sehVGSt1LHk09/p\nm+1LulLiDrS4jnTddaewBPDBgUwXOxpycjCRS2B8+W/Eo358EnJL1r3i1BgDIx50\nNx2BITDFfZ1hgbIMoBV3S7D0lpE/TeLP1T5YVQIDAQABAoIBABupX1W2LVBUS6oT\n9gC3pE82nD8fwABoSP6AD4yAnl9IbHX5Sd12eOqGc6k698g5QuhwrHYaNO2bqit6\nwEVUf/mvigq9cHNPFSUL6F8k0kJm4+FR00oEFnPH7gDZpkbG80R/RXYXJuw+LptC\n8HPJN32eNsSCmDDqNvO54lF4zwM8yAVlh6lj9/HVkU+Vynxq4YkAgPpr03ctVQMD\nekKU3F0SwIWXtQpnTI23YBGikHNr+0CZE627laUGOJbRJ3f+emZD4bq+QqdFvPMJ\nmpDBsMcW7ZOLzllu0BQ1lhO+L5SbbBJ4GJIPZENGylYhXIDOwr9O+wxTAMwbzQaK\ncCmH+oECgYEA9CpBev1BctZEIRWFHgCX8QCPA+ZxybFhSH3QJK1fn5XWjg9zAAbN\n0/KEGJjC2tO1PnyEatMLJfJYD37z244SCt9O03rx9chmTr6v1Hqqlaei3GLxFMUg\nXkQsWOizJ7ow5/0qEHigPsO5eSF6gyp1aI5SR0deV1YmIlUcQbgkF90CgYEA4Al6\n+wchEwAxvk/s2g3JVdNSYkNQYGJBx967zCJXuxrP4MF9eLFFqPN092HfzMnQopUG\nJ1CR5v/802AGb9snAUZgWEu3LgtxbH2qx6g3mpM2yavREP4yYNKRb8/cCo6G47Df\naszafRB9SNT2u/9FOU9jCoA3qjFvD92igXD7ttkCgYEAkYiKRRulIiTSsQGZubtS\n1WSm2gVGd5jRypqrMOFiKMXv//b3beGgV5+q2tpa8oHT+y3O47ltYK3ljT73bTtu\nR6q42lbi18QeLvt75GNFQDSOX1xeJConU+jAojH5b0mMkwqUQwMTSLXy3F93Ha12\nE98Y7cF9WwNPcZFXaVivssUCgYB+pr1gVgprjGuSk+po5uxP2ZQ0OqugoUtgq1jt\nMOj5vFGSVLAS39xqg583DpyPT/PjRW3iIdkphsOt1xYse+7T+K4UnFEk9ZEcbPpz\nvnQYrWqGndwlyB5AwCk51X8mdKZq552V6dMGaqD44HPPmaLPoEJ0OEG/tAx+IqRw\nmqeiGQKBgQDHUnmGulbMTDKJHJELOR4pltJQBanhLyJqcB3pX2khcqDI1dO3Fgo6\n3/q2dIM0T2WQEuhp1ubTYm6igUKJdzkjTqo0U8FNsvYQRutKDMR9YoBRVuK5Sgcw\nLULvmMD5lWiykOQHJR7rXK6Ozv5PsbMieEGQgsA4y+svKIrwyM2+Vw==\n-----END RSA PRIVATE KEY-----\n",
    "is_binary": false
  },
  "certs/ecdsa-p256.crt": {
    "path": "certs/ecdsa-p256.crt",
    "resolved_path": "demo_target/certs/ecdsa-p256.crt",
    "line": 1,
    "lines": [
      "-----BEGIN CERTIFICATE-----",
      "MIIBhjCCASygAwIBAgIUX7CEZgVnqSUlN/dLFm0+olYr8pYwCgYIKoZIzj0EAwIw",
      "QzEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMR4wHAYDVQQDDBVl",
      "ZGdlLmdvdi1wb3J0YWwubG9jYWwwHhcNMjYwODI1MDIxMTU3WhcNMjcwODI1MDIx",
      "MTU3WjBDMSEwHwYDVQQKDBhnb3YtcG9ydGFsLWxlZ2FjeSAoZGVtbykxHjAcBgNV",
      "BAMMFWVkZ2UuZ292LXBvcnRhbC5sb2NhbDBZMBMGByqGSM49AgEGCCqGSM49AwEH",
      "A0IABGB5jvmaUgUGBGnuVtjYOzF0ZTMKIDGRrqfU2QVYzO11RuDBx8h4qc17yIiS",
      "krAZ/nKV0hfl5OS9gnY64JinvgIwCgYIKoZIzj0EAwIDSAAwRQIgFao89wrvXHTg",
      "Ma1XcdzZyFoedmXtu134F7kKXTJYKocCIQCoUfUOybxX9XSTMJelDzHEIxAnVPxt",
      "ZFOfh2gPvClG0Q==",
      "-----END CERTIFICATE-----"
    ],
    "total_lines": 11,
    "content": "-----BEGIN CERTIFICATE-----\nMIIBhjCCASygAwIBAgIUX7CEZgVnqSUlN/dLFm0+olYr8pYwCgYIKoZIzj0EAwIw\nQzEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMR4wHAYDVQQDDBVl\nZGdlLmdvdi1wb3J0YWwubG9jYWwwHhcNMjYwODI1MDIxMTU3WhcNMjcwODI1MDIx\nMTU3WjBDMSEwHwYDVQQKDBhnb3YtcG9ydGFsLWxlZ2FjeSAoZGVtbykxHjAcBgNV\nBAMMFWVkZ2UuZ292LXBvcnRhbC5sb2NhbDBZMBMGByqGSM49AgEGCCqGSM49AwEH\nA0IABGB5jvmaUgUGBGnuVtjYOzF0ZTMKIDGRrqfU2QVYzO11RuDBx8h4qc17yIiS\nkrAZ/nKV0hfl5OS9gnY64JinvgIwCgYIKoZIzj0EAwIDSAAwRQIgFao89wrvXHTg\nMa1XcdzZyFoedmXtu134F7kKXTJYKocCIQCoUfUOybxX9XSTMJelDzHEIxAnVPxt\nZFOfh2gPvClG0Q==\n-----END CERTIFICATE-----\n",
    "is_binary": false
  },
  "certs/internal-ca.crt": {
    "path": "certs/internal-ca.crt",
    "resolved_path": "demo_target/certs/internal-ca.crt",
    "line": 1,
    "lines": [
      "-----BEGIN CERTIFICATE-----",
      "MIIE/jCCAuagAwIBAgIUMhKtMtEoBlrDZRSXsacwgvCEAg8wDQYJKoZIhvcNAQEL",
      "BQAwOTEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMRQwEgYDVQQD",
      "DAtpbnRlcm5hbC1jYTAeFw0yNjA4MjUwMjExNTdaFw0zNjA4MjIwMjExNTdaMDkx",
      "ITAfBgNVBAoMGGdvdi1wb3J0YWwtbGVnYWN5IChkZW1vKTEUMBIGA1UEAwwLaW50",
      "ZXJuYWwtY2EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCpF7U2DWAD",
      "HPGYGz5dQYtXn/wHVISpz3pI19tKrK5SLX5cAWEwPqxr9CJ6oMGc3uiuLdTpAi1O",
      "1TpcE+5w+pAR9oD8T2Efw5Ei8geetJsR0SVaUunPAzNb5VFHVmFs08os10dR5pwa",
      "fQqOU5HunaxhdekleGnFcHkI8Czhi1Je351/WwoLEWgizFuPl4Hpa6A/HpL79bl5",
      "1rxbDURq1dgDl6+ztTxSVc1JQvlXgDw2iBC2eGilTFljE4e/p/zZUHDhGmMrpRqw",
      "zkieRgUtACKBF9sFOm+fHuqf6WfCCv2HSVeWJjnrUriyRiAKIfuWRccVYbB4Oqsp",
      "Emb7Pkd/DhjtDUkalK6kwF6noFpZeN2o3LWHlgx3/yPwgrLYnQRaE7uhyuVtPKA4",
      "UkQ6qcw4T3eoznlDIKLSQut2E+KmIDC6rdKcCnM4LWBnyqaXh+iCX/HVwCBoUqSF",
      "hzR9VTmKnK4RbrlO+678n4OdSQ8zzilGPqAeLs2XlbHuto9VEt8mo1rA33gSCXsl",
      "MoIsUg0xjCO+lpqC5Ku2oaltejH2+fhuOG+nxGDRaR3mrWxXKgk3tbgF/0uT6ve/",
      "itG6CGXiktduQwsGQO2UFTkIrRrtSacaGaqkuDzHRrCwn0+rEzQ1vUMmyQjOB1vH",
      "Ho0ed5PN0sRStZwQmnL61ySPD8BnIsxzSwIDAQABMA0GCSqGSIb3DQEBCwUAA4IC",
      "AQA7khKnx/QsnnnBLUubgiQ8U2jg7tE54DvTfLjjGeXgoY9QHf3tapb44/Q29ffx",
      "Lx94sqxAb2pg8oq0S4QEAwVzx1ZBDmJptJFpyEfvMlkwrEZrmnNHK+/0FQPfXMqX",
      "U1UawpGPhdXC4vuAu8cdvDwIlT/w29Jhuu9KRy7lcOiggxApmDNtkkegrSgsuFHZ",
      "GLyGOYUTzD9KH09+lLCF1IX+LFu0s75w9FmFMWA6O+Q0+bGOdFfUynQ7F5LIFLn8",
      "N5dzsXKlZcOzYxOHW8KMulz9i6YrnRm2IosOCxouZlzKJjwEKIBg/IwrJ7gckUSt",
      "7UHv/ep/Etpn6PN1IYgBIN1Psu7Fq3xHz+eJh58TIfk04yCJ6ULKFKxcy46mjuPV",
      "0hKjnQc32a1aviCCs3aw4qJdb5razC4fEVOhFSiidPzecKx6jPcDAFVikl/uSikD",
      "t5ivQjluoHRA9zV2Cyz+07WuV4bSEnl84duz7NRRR3p60zp+IM6OEpZOuzPIwiS7",
      "AqXqaAsaMncC4b4j97gHFtS0cMPXOagt4XbGNLzIKRXFWt9cd1c9jCahfAg1lhj0",
      "Wysn27kBlpeNhNzKAfRNSXKP2VWFxMabVIfgSrhbJaj1V69mGdZL/xO6jjOzHEYE",
      "etjiC/uf7+5vN2bZwdZqOt5yO4MBto0OalSqIuHDMLaiQQ==",
      "-----END CERTIFICATE-----"
    ],
    "total_lines": 29,
    "content": "-----BEGIN CERTIFICATE-----\nMIIE/jCCAuagAwIBAgIUMhKtMtEoBlrDZRSXsacwgvCEAg8wDQYJKoZIhvcNAQEL\nBQAwOTEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMRQwEgYDVQQD\nDAtpbnRlcm5hbC1jYTAeFw0yNjA4MjUwMjExNTdaFw0zNjA4MjIwMjExNTdaMDkx\nITAfBgNVBAoMGGdvdi1wb3J0YWwtbGVnYWN5IChkZW1vKTEUMBIGA1UEAwwLaW50\nZXJuYWwtY2EwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCpF7U2DWAD\nHPGYGz5dQYtXn/wHVISpz3pI19tKrK5SLX5cAWEwPqxr9CJ6oMGc3uiuLdTpAi1O\n1TpcE+5w+pAR9oD8T2Efw5Ei8geetJsR0SVaUunPAzNb5VFHVmFs08os10dR5pwa\nfQqOU5HunaxhdekleGnFcHkI8Czhi1Je351/WwoLEWgizFuPl4Hpa6A/HpL79bl5\n1rxbDURq1dgDl6+ztTxSVc1JQvlXgDw2iBC2eGilTFljE4e/p/zZUHDhGmMrpRqw\nzkieRgUtACKBF9sFOm+fHuqf6WfCCv2HSVeWJjnrUriyRiAKIfuWRccVYbB4Oqsp\nEmb7Pkd/DhjtDUkalK6kwF6noFpZeN2o3LWHlgx3/yPwgrLYnQRaE7uhyuVtPKA4\nUkQ6qcw4T3eoznlDIKLSQut2E+KmIDC6rdKcCnM4LWBnyqaXh+iCX/HVwCBoUqSF\nhzR9VTmKnK4RbrlO+678n4OdSQ8zzilGPqAeLs2XlbHuto9VEt8mo1rA33gSCXsl\nMoIsUg0xjCO+lpqC5Ku2oaltejH2+fhuOG+nxGDRaR3mrWxXKgk3tbgF/0uT6ve/\nitG6CGXiktduQwsGQO2UFTkIrRrtSacaGaqkuDzHRrCwn0+rEzQ1vUMmyQjOB1vH\nHo0ed5PN0sRStZwQmnL61ySPD8BnIsxzSwIDAQABMA0GCSqGSIb3DQEBCwUAA4IC\nAQA7khKnx/QsnnnBLUubgiQ8U2jg7tE54DvTfLjjGeXgoY9QHf3tapb44/Q29ffx\nLx94sqxAb2pg8oq0S4QEAwVzx1ZBDmJptJFpyEfvMlkwrEZrmnNHK+/0FQPfXMqX\nU1UawpGPhdXC4vuAu8cdvDwIlT/w29Jhuu9KRy7lcOiggxApmDNtkkegrSgsuFHZ\nGLyGOYUTzD9KH09+lLCF1IX+LFu0s75w9FmFMWA6O+Q0+bGOdFfUynQ7F5LIFLn8\nN5dzsXKlZcOzYxOHW8KMulz9i6YrnRm2IosOCxouZlzKJjwEKIBg/IwrJ7gckUSt\n7UHv/ep/Etpn6PN1IYgBIN1Psu7Fq3xHz+eJh58TIfk04yCJ6ULKFKxcy46mjuPV\n0hKjnQc32a1aviCCs3aw4qJdb5razC4fEVOhFSiidPzecKx6jPcDAFVikl/uSikD\nt5ivQjluoHRA9zV2Cyz+07WuV4bSEnl84duz7NRRR3p60zp+IM6OEpZOuzPIwiS7\nAqXqaAsaMncC4b4j97gHFtS0cMPXOagt4XbGNLzIKRXFWt9cd1c9jCahfAg1lhj0\nWysn27kBlpeNhNzKAfRNSXKP2VWFxMabVIfgSrhbJaj1V69mGdZL/xO6jjOzHEYE\netjiC/uf7+5vN2bZwdZqOt5yO4MBto0OalSqIuHDMLaiQQ==\n-----END CERTIFICATE-----\n",
    "is_binary": false
  },
  "certs/legacy-portal.crt": {
    "path": "certs/legacy-portal.crt",
    "resolved_path": "demo_target/certs/legacy-portal.crt",
    "line": 1,
    "lines": [
      "-----BEGIN CERTIFICATE-----",
      "MIIB/TCCAWagAwIBAgIUYFY0Q0m6acN2Av5knS8uLc2h6c0wDQYJKoZIhvcNAQEL",
      "BQAwOzEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMRYwFAYDVQQD",
      "DA1sZWdhY3ktcG9ydGFsMB4XDTIxMDQwMzAyMTE1N1oXDTIyMDQwMzAyMTE1N1ow",
      "OzEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMRYwFAYDVQQDDA1s",
      "ZWdhY3ktcG9ydGFsMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC90+KwNkEe",
      "hgfNZa+bgw7qpQ4nwvrYUDvioUMlrte5gwn2/Cli61OxX3S+54Cgj5ZFR4RE0vmD",
      "Hc5H+LLULyzkDbnQxR7Kv8Q1+OF3KL3EhJvMKmMurO6LQSm29l7ebD1zhtIy3H7X",
      "GKClYMpGKkbTTD9GkDzwdVcuh64ecGCcEQIDAQABMA0GCSqGSIb3DQEBCwUAA4GB",
      "ABl0qZ5Jx7YRYvmdRxnTMC/Ptt53FnBPFaz7ET+V8qCCDwd53Z4kUoQAoQq+FGtR",
      "SO5B3cXTknSSF+BFOc0ZW60g4o+eT8gtV3JPLlVq6LshwWCxrSX7/0Anw7f7QWwg",
      "H4fEfQIEy/WqNu3JrtmNpneUxXzGgb4ZtFQbCnH6gvYi",
      "-----END CERTIFICATE-----"
    ],
    "total_lines": 13,
    "content": "-----BEGIN CERTIFICATE-----\nMIIB/TCCAWagAwIBAgIUYFY0Q0m6acN2Av5knS8uLc2h6c0wDQYJKoZIhvcNAQEL\nBQAwOzEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMRYwFAYDVQQD\nDA1sZWdhY3ktcG9ydGFsMB4XDTIxMDQwMzAyMTE1N1oXDTIyMDQwMzAyMTE1N1ow\nOzEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMRYwFAYDVQQDDA1s\nZWdhY3ktcG9ydGFsMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC90+KwNkEe\nhgfNZa+bgw7qpQ4nwvrYUDvioUMlrte5gwn2/Cli61OxX3S+54Cgj5ZFR4RE0vmD\nHc5H+LLULyzkDbnQxR7Kv8Q1+OF3KL3EhJvMKmMurO6LQSm29l7ebD1zhtIy3H7X\nGKClYMpGKkbTTD9GkDzwdVcuh64ecGCcEQIDAQABMA0GCSqGSIb3DQEBCwUAA4GB\nABl0qZ5Jx7YRYvmdRxnTMC/Ptt53FnBPFaz7ET+V8qCCDwd53Z4kUoQAoQq+FGtR\nSO5B3cXTknSSF+BFOc0ZW60g4o+eT8gtV3JPLlVq6LshwWCxrSX7/0Anw7f7QWwg\nH4fEfQIEy/WqNu3JrtmNpneUxXzGgb4ZtFQbCnH6gvYi\n-----END CERTIFICATE-----\n",
    "is_binary": false
  },
  "conf/java.security": {
    "path": "conf/java.security",
    "resolved_path": "demo_target/conf/java.security",
    "line": 1,
    "lines": [
      "# demo JVM security overrides",
      "jdk.tls.disabledAlgorithms=SSLv3, MD5withRSA",
      "jdk.tls.legacyAlgorithms=DES, DESede, RC4"
    ],
    "total_lines": 3,
    "content": "# demo JVM security overrides\njdk.tls.disabledAlgorithms=SSLv3, MD5withRSA\njdk.tls.legacyAlgorithms=DES, DESede, RC4\n",
    "is_binary": false
  },
  "conf/nginx-edge.conf": {
    "path": "conf/nginx-edge.conf",
    "resolved_path": "demo_target/conf/nginx-edge.conf",
    "line": 1,
    "lines": [
      "server {",
      "    listen 8443 ssl;",
      "    server_name edge.gov-portal.local;",
      "    ssl_protocols TLSv1.3;",
      "    ssl_ecdh_curve X25519MLKEM768:X25519;",
      "    ssl_certificate certs/ecdsa-p256.crt;",
      "    ssl_certificate_key certs/ecdsa-p256.key;",
      "}"
    ],
    "total_lines": 8,
    "content": "server {\n    listen 8443 ssl;\n    server_name edge.gov-portal.local;\n    ssl_protocols TLSv1.3;\n    ssl_ecdh_curve X25519MLKEM768:X25519;\n    ssl_certificate certs/ecdsa-p256.crt;\n    ssl_certificate_key certs/ecdsa-p256.key;\n}\n",
    "is_binary": false
  },
  "conf/nginx.conf": {
    "path": "conf/nginx.conf",
    "resolved_path": "demo_target/conf/nginx.conf",
    "line": 1,
    "lines": [
      "server {",
      "    listen 443 ssl;",
      "    server_name portal.gov-portal.local;",
      "    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;",
      "    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:AES128-SHA:DES-CBC3-SHA;",
      "    ssl_certificate certs/api-gw.crt;",
      "    ssl_certificate_key certs/api-gw.key;",
      "}"
    ],
    "total_lines": 8,
    "content": "server {\n    listen 443 ssl;\n    server_name portal.gov-portal.local;\n    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;\n    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:AES128-SHA:DES-CBC3-SHA;\n    ssl_certificate certs/api-gw.crt;\n    ssl_certificate_key certs/api-gw.key;\n}\n",
    "is_binary": false
  },
  "Dockerfile": {
    "path": "Dockerfile",
    "resolved_path": "demo_target/Dockerfile",
    "line": 1,
    "lines": [
      "FROM debian:9",
      "RUN apt-get update && apt-get install -y openssl=1.1.1k-1 curl",
      "COPY certs/api-gw.crt /app/certs/api-gw.crt"
    ],
    "total_lines": 3,
    "content": "FROM debian:9\nRUN apt-get update && apt-get install -y openssl=1.1.1k-1 curl\nCOPY certs/api-gw.crt /app/certs/api-gw.crt\n",
    "is_binary": false
  },
  "image/app-image.tar": {
    "path": "image/app-image.tar",
    "resolved_path": "demo_target/image/app-image.tar",
    "line": 1,
    "lines": [
      "manifest.json\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u00000000644\u00000000000\u00000000000\u000000000000136\u000000000000000\u0000010446\u0000 0\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000ustar\u000000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000[{\"Config\": \"config.json\", \"RepoTags\": [\"gov-portal:legacy\"], \"Layers\": [\"a1b2c3/layer.tar\"]}]\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000config.json\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u00000000644\u00000000000\u00000000000\u000000000000045\u000000000000000\u0000010104\u0000 0\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000ustar\u000000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000{\"architecture\":\"amd64\",\"os\":\"linux\"}\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000a1b2c3/layer.tar\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u00000000644\u00000000000\u00000000000\u000000000024000\u000000000000000\u0000010540\u0000 0\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000ustar\u000000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000app/certs/api-gw.crt\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u00000000644\u00000000000\u00000000000\u000000000002153\u000000000000000\u0000011544\u0000 0\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000ustar\u000000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000-----BEGIN CERTIFICATE-----",
      "MIIDFjCCAf6gAwIBAgIUBEDLf0BwjyG4/1Y5CnohV4b5JpEwDQYJKoZIhvcNAQEL",
      "BQAwRTEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMSAwHgYDVQQD",
      "DBdhcGktZ3cuZ292LXBvcnRhbC5sb2NhbDAeFw0yNjA4MjUwMjExNTdaFw0yNzA4",
      "MjUwMjExNTdaMEUxITAfBgNVBAoMGGdvdi1wb3J0YWwtbGVnYWN5IChkZW1vKTEg",
      "MB4GA1UEAwwXYXBpLWd3Lmdvdi1wb3J0YWwubG9jYWwwggEiMA0GCSqGSIb3DQEB",
      "AQUAA4IBDwAwggEKAoIBAQDVrgQTeluvbCUgNwpmhaS3ykXvtKh/tPfgaLTxZo8l",
      "BJQrJFM+aTMV08UXAwxJam3i5jKn+JuxzkQMN+AjY0DCjNiZwNnC6a9Bz+JmgieQ",
      "wFcmbvCLv82LW2wMTPqU232CTzyhogHKzjzgD82ChlCXSSeM5TnrjdDdoFktHVgc",
      "XWqJW5KXBYFOPP+JYtLTwxnNyVG7lezaVF/pamzUhII3cV+9RcN+olzSx6FUZK3U",
      "seTT3+mb7Uu6UuIOtLiOdN11p7AE8MGBTBc7GnJyMJFLYHz5b8SjfnwSckvWveLU",
      "GAMjHnQ3HYEhMMV9nWGBsgygFXdLsPSWkT9N4s/VPlhVAgMBAAEwDQYJKoZIhvcN",
      "AQELBQADggEBAClPZ9ESWkrLERI0eEZYWRRNdmt3xIjGB7S0/11gQpYmkKWrV0B/",
      "lJLIt7ingcrHXK+IcRw3/nKCdD51K7R9h20TK2Y8sn4T8DffcNugCHjYUvpSxeg7",
      "nG2P11UbT+Jg9O7X4D3j4qKNJuKRVTfb0K+KoplM5ShgqMi1urYeYRQec9bMAkng",
      "69rq/fmF1EV4NBjvOhrjd3ze/aXvb4j9wKokfbXV82uJuHN2RUnjJVo0ZNv0ZFvd",
      "kMIXJm6Mh4iYU+ezYG51eThE6V4xKU13nS2bkwJ/dJcjlAk0zQYVzzFgTwV5ddwC",
      "iyckzq3BBVvq7DYPw3nSDhZKs3crKwWTkAI=",
      "-----END CERTIFICATE-----",
      "\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000"
    ],
    "total_lines": 20,
    "content": "manifest.json\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u00000000644\u00000000000\u00000000000\u000000000000136\u000000000000000\u0000010446\u0000 0\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000ustar\u000000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000[{\"Config\": \"config.json\", \"RepoTags\": [\"gov-portal:legacy\"], \"Layers\": [\"a1b2c3/layer.tar\"]}]\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000config.json\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u00000000644\u00000000000\u00000000000\u000000000000045\u000000000000000\u0000010104\u0000 0\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000ustar\u000000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000{\"architecture\":\"amd64\",\"os\":\"linux\"}\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000a1b2c3/layer.tar\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u00000000644\u00000000000\u00000000000\u000000000024000\u000000000000000\u0000010540\u0000 0\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000ustar\u000000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000app/certs/api-gw.crt\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u00000000644\u00000000000\u00000000000\u000000000002153\u000000000000000\u0000011544\u0000 0\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000ustar\u000000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000-----BEGIN CERTIFICATE-----\nMIIDFjCCAf6gAwIBAgIUBEDLf0BwjyG4/1Y5CnohV4b5JpEwDQYJKoZIhvcNAQEL\nBQAwRTEhMB8GA1UECgwYZ292LXBvcnRhbC1sZWdhY3kgKGRlbW8pMSAwHgYDVQQD\nDBdhcGktZ3cuZ292LXBvcnRhbC5sb2NhbDAeFw0yNjA4MjUwMjExNTdaFw0yNzA4\nMjUwMjExNTdaMEUxITAfBgNVBAoMGGdvdi1wb3J0YWwtbGVnYWN5IChkZW1vKTEg\nMB4GA1UEAwwXYXBpLWd3Lmdvdi1wb3J0YWwubG9jYWwwggEiMA0GCSqGSIb3DQEB\nAQUAA4IBDwAwggEKAoIBAQDVrgQTeluvbCUgNwpmhaS3ykXvtKh/tPfgaLTxZo8l\nBJQrJFM+aTMV08UXAwxJam3i5jKn+JuxzkQMN+AjY0DCjNiZwNnC6a9Bz+JmgieQ\nwFcmbvCLv82LW2wMTPqU232CTzyhogHKzjzgD82ChlCXSSeM5TnrjdDdoFktHVgc\nXWqJW5KXBYFOPP+JYtLTwxnNyVG7lezaVF/pamzUhII3cV+9RcN+olzSx6FUZK3U\nseTT3+mb7Uu6UuIOtLiOdN11p7AE8MGBTBc7GnJyMJFLYHz5b8SjfnwSckvWveLU\nGAMjHnQ3HYEhMMV9nWGBsgygFXdLsPSWkT9N4s/VPlhVAgMBAAEwDQYJKoZIhvcN\nAQELBQADggEBAClPZ9ESWkrLERI0eEZYWRRNdmt3xIjGB7S0/11gQpYmkKWrV0B/\nlJLIt7ingcrHXK+IcRw3/nKCdD51K7R9h20TK2Y8sn4T8DffcNugCHjYUvpSxeg7\nnG2P11UbT+Jg9O7X4D3j4qKNJuKRVTfb0K+KoplM5ShgqMi1urYeYRQec9bMAkng\n69rq/fmF1EV4NBjvOhrjd3ze/aXvb4j9wKokfbXV82uJuHN2RUnjJVo0ZNv0ZFvd\nkMIXJm6Mh4iYU+ezYG51eThE6V4xKU13nS2bkwJ/dJcjlAk0zQYVzzFgTwV5ddwC\niyckzq3BBVvq7DYPw3nSDhZKs3crKwWTkAI=\n-----END CERTIFICATE-----\n\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000",
    "is_binary": false
  },
  "infra/kms.tf": {
    "path": "infra/kms.tf",
    "resolved_path": "demo_target/infra/kms.tf",
    "line": 1,
    "lines": [
      "resource \"aws_kms_key\" \"portal_signing\" {",
      "  description = \"portal signing key\"",
      "  key_usage   = \"SIGN_VERIFY\"",
      "  key_spec    = \"RSA_2048\"",
      "}"
    ],
    "total_lines": 5,
    "content": "resource \"aws_kms_key\" \"portal_signing\" {\n  description = \"portal signing key\"\n  key_usage   = \"SIGN_VERIFY\"\n  key_spec    = \"RSA_2048\"\n}\n",
    "is_binary": false
  },
  "keystore/app.p12": {
    "path": "keystore/app.p12",
    "resolved_path": "demo_target/keystore/app.p12",
    "line": 1,
    "lines": [],
    "total_lines": 0,
    "content": "",
    "is_binary": true
  },
  "package.json": {
    "path": "package.json",
    "resolved_path": "demo_target/package.json",
    "line": 1,
    "lines": [
      "{",
      "  \"name\": \"gov-portal-web\",",
      "  \"version\": \"1.0.0\",",
      "  \"dependencies\": {",
      "    \"node-forge\": \"0.9.1\",",
      "    \"jsonwebtoken\": \"8.5.1\",",
      "    \"express\": \"4.17.1\"",
      "  }",
      "}"
    ],
    "total_lines": 9,
    "content": "{\n  \"name\": \"gov-portal-web\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"node-forge\": \"0.9.1\",\n    \"jsonwebtoken\": \"8.5.1\",\n    \"express\": \"4.17.1\"\n  }\n}\n",
    "is_binary": false
  },
  "payments/Crypto.java": {
    "path": "payments/Crypto.java",
    "resolved_path": "demo_target/payments/Crypto.java",
    "line": 1,
    "lines": [
      "import java.security.*;",
      "import javax.crypto.Cipher;",
      "",
      "public class Crypto {",
      "    static byte[] digest(byte[] data) throws Exception {",
      "        return MessageDigest.getInstance(\"SHA-1\").digest(data);",
      "    }",
      "",
      "    static KeyPair newKey() throws Exception {",
      "        KeyPairGenerator kpg = KeyPairGenerator.getInstance(\"RSA\");",
      "        kpg.initialize(2048);",
      "        return kpg.generateKeyPair();",
      "    }",
      "",
      "    static Cipher legacyCipher() throws Exception {",
      "        return Cipher.getInstance(\"DES/CBC/PKCS5Padding\");",
      "    }",
      "}"
    ],
    "total_lines": 18,
    "content": "import java.security.*;\nimport javax.crypto.Cipher;\n\npublic class Crypto {\n    static byte[] digest(byte[] data) throws Exception {\n        return MessageDigest.getInstance(\"SHA-1\").digest(data);\n    }\n\n    static KeyPair newKey() throws Exception {\n        KeyPairGenerator kpg = KeyPairGenerator.getInstance(\"RSA\");\n        kpg.initialize(2048);\n        return kpg.generateKeyPair();\n    }\n\n    static Cipher legacyCipher() throws Exception {\n        return Cipher.getInstance(\"DES/CBC/PKCS5Padding\");\n    }\n}\n",
    "is_binary": false
  },
  "pom.xml": {
    "path": "pom.xml",
    "resolved_path": "demo_target/pom.xml",
    "line": 1,
    "lines": [
      "<project>",
      "  <modelVersion>4.0.0</modelVersion>",
      "  <groupId>gov.portal</groupId>",
      "  <artifactId>payments</artifactId>",
      "  <version>1.0</version>",
      "  <dependencies>",
      "    <dependency>",
      "      <groupId>org.bouncycastle</groupId>",
      "      <artifactId>bcprov-jdk15on</artifactId>",
      "      <version>1.60</version>",
      "    </dependency>",
      "  </dependencies>",
      "</project>"
    ],
    "total_lines": 13,
    "content": "<project>\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>gov.portal</groupId>\n  <artifactId>payments</artifactId>\n  <version>1.0</version>\n  <dependencies>\n    <dependency>\n      <groupId>org.bouncycastle</groupId>\n      <artifactId>bcprov-jdk15on</artifactId>\n      <version>1.60</version>\n    </dependency>\n  </dependencies>\n</project>\n",
    "is_binary": false
  },
  "README.md": {
    "path": "README.md",
    "resolved_path": "demo_target/README.md",
    "line": 1,
    "lines": [
      "# gov-portal-legacy (SYNTHETIC DEMO TARGET)",
      "",
      "Generated by `python -m mox make-demo`. Everything here is synthetic and safe. `vendor/sync-agent.bin` is NOT a real binary: it is a blob containing marker strings for the scanner."
    ],
    "total_lines": 3,
    "content": "# gov-portal-legacy (SYNTHETIC DEMO TARGET)\n\nGenerated by `python -m mox make-demo`. Everything here is synthetic and safe. `vendor/sync-agent.bin` is NOT a real binary: it is a blob containing marker strings for the scanner.\n",
    "is_binary": false
  },
  "requirements.txt": {
    "path": "requirements.txt",
    "resolved_path": "demo_target/requirements.txt",
    "line": 1,
    "lines": [
      "pycryptodome==3.9.0",
      "cryptography==2.9",
      "flask==1.1.2"
    ],
    "total_lines": 3,
    "content": "pycryptodome==3.9.0\ncryptography==2.9\nflask==1.1.2\n",
    "is_binary": false
  },
  "services/ecdsa.go": {
    "path": "services/ecdsa.go",
    "resolved_path": "demo_target/services/ecdsa.go",
    "line": 1,
    "lines": [
      "package services",
      "",
      "import (",
      "\t\"crypto/ecdsa\"",
      "\t\"crypto/elliptic\"",
      "\t\"crypto/rand\"",
      ")",
      "",
      "func NewSigningKey() (*ecdsa.PrivateKey, error) {",
      "\treturn ecdsa.GenerateKey(elliptic.P256(), rand.Reader)",
      "}"
    ],
    "total_lines": 11,
    "content": "package services\n\nimport (\n\t\"crypto/ecdsa\"\n\t\"crypto/elliptic\"\n\t\"crypto/rand\"\n)\n\nfunc NewSigningKey() (*ecdsa.PrivateKey, error) {\n\treturn ecdsa.GenerateKey(elliptic.P256(), rand.Reader)\n}\n",
    "is_binary": false
  },
  "utils/legacy_aes.py": {
    "path": "utils/legacy_aes.py",
    "resolved_path": "demo_target/utils/legacy_aes.py",
    "line": 1,
    "lines": [
      "from Crypto.Cipher import AES",
      "",
      "",
      "def encrypt_blob(key: bytes, blob: bytes) -> bytes:",
      "    cipher = AES.new(key, AES.MODE_ECB)",
      "    return cipher.encrypt(blob)"
    ],
    "total_lines": 6,
    "content": "from Crypto.Cipher import AES\n\n\ndef encrypt_blob(key: bytes, blob: bytes) -> bytes:\n    cipher = AES.new(key, AES.MODE_ECB)\n    return cipher.encrypt(blob)\n",
    "is_binary": false
  },
  "vendor/sync-agent.bin": {
    "path": "vendor/sync-agent.bin",
    "resolved_path": "demo_target/vendor/sync-agent.bin",
    "line": 1,
    "lines": [
      "\u007fELF\u0002\u0001\u0001\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000SYNTHETIC-DEMO-BLOB\u0000OpenSSL 1.1.1k  25 Mar 2021\u0000RSA_generate_key\u0000MD5_Init\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000"
    ],
    "total_lines": 1,
    "content": "\u007fELF\u0002\u0001\u0001\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000SYNTHETIC-DEMO-BLOB\u0000OpenSSL 1.1.1k  25 Mar 2021\u0000RSA_generate_key\u0000MD5_Init\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000",
    "is_binary": false
  },
  "web/sign.js": {
    "path": "web/sign.js",
    "resolved_path": "demo_target/web/sign.js",
    "line": 1,
    "lines": [
      "const crypto = require('crypto');",
      "",
      "function fingerprint(s) {",
      "  return crypto.createHash('md5').update(s).digest('hex');",
      "}",
      "",
      "function sign(data, pem) {",
      "  const signer = crypto.createSign('RSA-SHA256');",
      "  signer.update(data);",
      "  return signer.sign(pem, 'base64');",
      "}",
      "",
      "module.exports = { fingerprint, sign };"
    ],
    "total_lines": 13,
    "content": "const crypto = require('crypto');\n\nfunction fingerprint(s) {\n  return crypto.createHash('md5').update(s).digest('hex');\n}\n\nfunction sign(data, pem) {\n  const signer = crypto.createSign('RSA-SHA256');\n  signer.update(data);\n  return signer.sign(pem, 'base64');\n}\n\nmodule.exports = { fingerprint, sign };\n",
    "is_binary": false
  }
};

export const DEMO_FIXES = {
  "362": {
    "id": 13,
    "finding_id": 362,
    "file": "conf/nginx.conf",
    "status": "previewed",
    "diff": "--- a/conf/nginx.conf\n+++ b/conf/nginx.conf\n@@ -1,8 +1,9 @@\n server {\r\n     listen 443 ssl;\r\n     server_name portal.gov-portal.local;\r\n-    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;\r\n-    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:AES128-SHA:DES-CBC3-SHA;\r\n+    ssl_protocols TLSv1.2 TLSv1.3;\r\n+    ssl_ecdh_curve X25519MLKEM768:X25519;\r\n+    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256;\r\n     ssl_certificate certs/api-gw.crt;\r\n     ssl_certificate_key certs/api-gw.key;\r\n }\r\n",
    "backup": null,
    "created_at": "2026-09-28T17:40:00+00:00",
    "scan_id": 19,
    "algorithm": "TLSv1",
    "line": 4,
    "key_size": null,
    "src_sha": "2ab9e80bb067e1d1f2e9568fedb2fd2986045b71d46bd40c22c1c03a778f3f81",
    "lines_changed": 5,
    "old": "server {\r\n    listen 443 ssl;\r\n    server_name portal.gov-portal.local;\r\n    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;\r\n    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:AES128-SHA:DES-CBC3-SHA;\r\n    ssl_certificate certs/api-gw.crt;\r\n    ssl_certificate_key certs/api-gw.key;\r\n}\r\n",
    "new": "server {\r\n    listen 443 ssl;\r\n    server_name portal.gov-portal.local;\r\n    ssl_protocols TLSv1.2 TLSv1.3;\r\n    ssl_ecdh_curve X25519MLKEM768:X25519;\r\n    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256;\r\n    ssl_certificate certs/api-gw.crt;\r\n    ssl_certificate_key certs/api-gw.key;\r\n}\r\n",
    "claims": [
      {
        "claim": "Legacy protocols (SSLv3, TLS 1.0, TLS 1.1) disabled",
        "state": "in-effect",
        "detail": "ssl_protocols TLSv1.2 TLSv1.3"
      },
      {
        "claim": "Hybrid X25519MLKEM768 negotiable",
        "state": "in-effect",
        "detail": "TLS 1.3 enabled and the group is listed first"
      },
      {
        "claim": "Server TLS library supports X25519MLKEM768",
        "state": "not-verified",
        "detail": "needs OpenSSL 3.5+ (or a PQ-capable fork); MOX cannot see the server build offline, and its own probe cannot offer the group. Check with a PQ-capable client before relying on it."
      },
      {
        "claim": "Harvest-now exposure removed",
        "state": "not-in-effect",
        "limit": true,
        "detail": "classical fallback still negotiable (X25519, TLS 1.2): clients without ML-KEM still get a harvestable key exchange"
      },
      {
        "claim": "Static-RSA key transport disabled",
        "state": "in-effect",
        "detail": "every listed suite is ECDHE / DHE"
      }
    ],
    "trail": [
      {
        "ts": "2026-09-28T17:40:00+00:00",
        "text": "finding F-0362 opened \u00b7 TLSv1"
      },
      {
        "ts": "2026-09-28T17:40:00+00:00",
        "text": "patch generated \u00b7 5 changed lines"
      }
    ]
  },
  "350": {
    "id": 14,
    "finding_id": 350,
    "file": "auth/passwords.py",
    "status": "previewed",
    "diff": "--- a/auth/passwords.py\n+++ b/auth/passwords.py\n@@ -2,4 +2,4 @@\n \r\n \r\n def hash_password(pw: str) -> str:\r\n-    return hashlib.md5(pw.encode()).hexdigest()\r\n+    return hashlib.sha256(pw.encode()).hexdigest()\r\n",
    "backup": null,
    "created_at": "2026-09-28T17:40:00+00:00",
    "scan_id": 19,
    "algorithm": "MD5",
    "line": 5,
    "key_size": null,
    "src_sha": "de6695b503c235fdf2558e9ad34923e9aa51c904b6db48b969fb3d70eed94d2f",
    "lines_changed": 2,
    "old": "import hashlib\r\n\r\n\r\ndef hash_password(pw: str) -> str:\r\n    return hashlib.md5(pw.encode()).hexdigest()\r\n",
    "new": "import hashlib\r\n\r\n\r\ndef hash_password(pw: str) -> str:\r\n    return hashlib.sha256(pw.encode()).hexdigest()\r\n",
    "claims": [],
    "trail": [
      {
        "ts": "2026-09-28T17:40:00+00:00",
        "text": "finding F-0350 opened \u00b7 MD5"
      },
      {
        "ts": "2026-09-28T17:40:00+00:00",
        "text": "patch generated \u00b7 2 changed lines"
      }
    ]
  },
  "369": {
    "id": 15,
    "finding_id": 369,
    "file": "payments/Crypto.java",
    "status": "previewed",
    "diff": "--- a/payments/Crypto.java\n+++ b/payments/Crypto.java\n@@ -3,7 +3,7 @@\n \r\n public class Crypto {\r\n     static byte[] digest(byte[] data) throws Exception {\r\n-        return MessageDigest.getInstance(\"SHA-1\").digest(data);\r\n+        return MessageDigest.getInstance(\"SHA-256\").digest(data);\r\n     }\r\n \r\n     static KeyPair newKey() throws Exception {\r\n",
    "backup": null,
    "created_at": "2026-09-28T17:40:00+00:00",
    "scan_id": 19,
    "algorithm": "SHA-1",
    "line": 6,
    "key_size": null,
    "src_sha": "19289e9b2f6b719e40cbe14deb00cc04c169fc3660dcc187848e45fb29ebb8b5",
    "lines_changed": 2,
    "old": "import java.security.*;\r\nimport javax.crypto.Cipher;\r\n\r\npublic class Crypto {\r\n    static byte[] digest(byte[] data) throws Exception {\r\n        return MessageDigest.getInstance(\"SHA-1\").digest(data);\r\n    }\r\n\r\n    static KeyPair newKey() throws Exception {\r\n        KeyPairGenerator kpg = KeyPairGenerator.getInstance(\"RSA\");\r\n        kpg.initialize(2048);\r\n        return kpg.generateKeyPair();\r\n    }\r\n\r\n    static Cipher legacyCipher() throws Exception {\r\n        return Cipher.getInstance(\"DES/CBC/PKCS5Padding\");\r\n    }\r\n}\r\n",
    "new": "import java.security.*;\r\nimport javax.crypto.Cipher;\r\n\r\npublic class Crypto {\r\n    static byte[] digest(byte[] data) throws Exception {\r\n        return MessageDigest.getInstance(\"SHA-256\").digest(data);\r\n    }\r\n\r\n    static KeyPair newKey() throws Exception {\r\n        KeyPairGenerator kpg = KeyPairGenerator.getInstance(\"RSA\");\r\n        kpg.initialize(2048);\r\n        return kpg.generateKeyPair();\r\n    }\r\n\r\n    static Cipher legacyCipher() throws Exception {\r\n        return Cipher.getInstance(\"DES/CBC/PKCS5Padding\");\r\n    }\r\n}\r\n",
    "claims": [],
    "trail": [
      {
        "ts": "2026-09-28T17:40:00+00:00",
        "text": "finding F-0369 opened \u00b7 SHA-1"
      },
      {
        "ts": "2026-09-28T17:40:00+00:00",
        "text": "patch generated \u00b7 2 changed lines"
      }
    ]
  },
  "377": {
    "id": 16,
    "finding_id": 377,
    "file": "web/sign.js",
    "status": "previewed",
    "diff": "--- a/web/sign.js\n+++ b/web/sign.js\n@@ -1,7 +1,7 @@\n const crypto = require('crypto');\r\n \r\n function fingerprint(s) {\r\n-  return crypto.createHash('md5').update(s).digest('hex');\r\n+  return crypto.createHash('sha256').update(s).digest('hex');\r\n }\r\n \r\n function sign(data, pem) {\r\n",
    "backup": null,
    "created_at": "2026-09-28T17:40:00+00:00",
    "scan_id": 19,
    "algorithm": "MD5",
    "line": 4,
    "key_size": null,
    "src_sha": "e04783a8f5a34e9a3a92bd7455370bd997ef716b7ffe699cc660f9e755325819",
    "lines_changed": 2,
    "old": "const crypto = require('crypto');\r\n\r\nfunction fingerprint(s) {\r\n  return crypto.createHash('md5').update(s).digest('hex');\r\n}\r\n\r\nfunction sign(data, pem) {\r\n  const signer = crypto.createSign('RSA-SHA256');\r\n  signer.update(data);\r\n  return signer.sign(pem, 'base64');\r\n}\r\n\r\nmodule.exports = { fingerprint, sign };\r\n",
    "new": "const crypto = require('crypto');\r\n\r\nfunction fingerprint(s) {\r\n  return crypto.createHash('sha256').update(s).digest('hex');\r\n}\r\n\r\nfunction sign(data, pem) {\r\n  const signer = crypto.createSign('RSA-SHA256');\r\n  signer.update(data);\r\n  return signer.sign(pem, 'base64');\r\n}\r\n\r\nmodule.exports = { fingerprint, sign };\r\n",
    "claims": [],
    "trail": [
      {
        "ts": "2026-09-28T17:40:00+00:00",
        "text": "finding F-0377 opened \u00b7 MD5"
      },
      {
        "ts": "2026-09-28T17:40:00+00:00",
        "text": "patch generated \u00b7 2 changed lines"
      }
    ]
  },
  "370": {
    "id": 17,
    "finding_id": 370,
    "file": "payments/Crypto.java",
    "status": "previewed",
    "diff": "--- a/payments/Crypto.java\n+++ b/payments/Crypto.java\n@@ -8,7 +8,7 @@\n \r\n     static KeyPair newKey() throws Exception {\r\n         KeyPairGenerator kpg = KeyPairGenerator.getInstance(\"RSA\");\r\n-        kpg.initialize(2048);\r\n+        kpg.initialize(3072);  // interim: plan ML-DSA-65 hybrid\n         return kpg.generateKeyPair();\r\n     }\r\n \r\n",
    "backup": null,
    "created_at": "2026-09-28T17:40:00+00:00",
    "scan_id": 19,
    "algorithm": "RSA",
    "line": 11,
    "key_size": 2048,
    "src_sha": "19289e9b2f6b719e40cbe14deb00cc04c169fc3660dcc187848e45fb29ebb8b5",
    "lines_changed": 2,
    "old": "import java.security.*;\r\nimport javax.crypto.Cipher;\r\n\r\npublic class Crypto {\r\n    static byte[] digest(byte[] data) throws Exception {\r\n        return MessageDigest.getInstance(\"SHA-1\").digest(data);\r\n    }\r\n\r\n    static KeyPair newKey() throws Exception {\r\n        KeyPairGenerator kpg = KeyPairGenerator.getInstance(\"RSA\");\r\n        kpg.initialize(2048);\r\n        return kpg.generateKeyPair();\r\n    }\r\n\r\n    static Cipher legacyCipher() throws Exception {\r\n        return Cipher.getInstance(\"DES/CBC/PKCS5Padding\");\r\n    }\r\n}\r\n",
    "new": "import java.security.*;\r\nimport javax.crypto.Cipher;\r\n\r\npublic class Crypto {\r\n    static byte[] digest(byte[] data) throws Exception {\r\n        return MessageDigest.getInstance(\"SHA-1\").digest(data);\r\n    }\r\n\r\n    static KeyPair newKey() throws Exception {\r\n        KeyPairGenerator kpg = KeyPairGenerator.getInstance(\"RSA\");\r\n        kpg.initialize(3072);  // interim: plan ML-DSA-65 hybrid\n        return kpg.generateKeyPair();\r\n    }\r\n\r\n    static Cipher legacyCipher() throws Exception {\r\n        return Cipher.getInstance(\"DES/CBC/PKCS5Padding\");\r\n    }\r\n}\r\n",
    "claims": [],
    "trail": [
      {
        "ts": "2026-09-28T17:40:00+00:00",
        "text": "finding F-0370 opened \u00b7 RSA 2048"
      },
      {
        "ts": "2026-09-28T17:40:00+00:00",
        "text": "patch generated \u00b7 2 changed lines"
      }
    ]
  }
};

export const DEMO_HISTORY = [
  {
    "id": 19,
    "target": "demo_target",
    "started_at": "2026-09-28T15:58:25+00:00",
    "seconds": 0.187,
    "files_scanned": 23,
    "findings_count": 35,
    "planes_hit": "{\"containers\": 2, \"dependencies\": 5, \"code\": 9, \"certificates\": 6, \"configs\": 10, \"binaries\": 3}",
    "project_id": 1,
    "project_name": "demo_target (Enterprise Demo)",
    "is_demo": true
  }
];

export const DEMO_AUDIT = [
  {
    "id": 1,
    "ts": "2026-09-28T15:58:25+00:00",
    "actor": "demo-analyst",
    "action": "scan-start",
    "detail": "Scan demo_target (23 files, 6 planes)"
  },
  {
    "id": 2,
    "ts": "2026-09-28T15:58:26+00:00",
    "actor": "demo-analyst",
    "action": "detect",
    "detail": "26 cryptographic assets mapped across 7 planes"
  },
  {
    "id": 3,
    "ts": "2026-09-28T15:58:26+00:00",
    "actor": "demo-analyst",
    "action": "cbom-generate",
    "detail": "CycloneDX 1.6 Cryptographic BOM built"
  },
  {
    "id": 4,
    "ts": "2026-09-28T15:58:27+00:00",
    "actor": "demo-analyst",
    "action": "attest-verify",
    "detail": "Sector attestation verified with Ed25519 signature"
  }
];

export const DEMO_NETSTAT = {
  "installed": true,
  "since": "2026-09-28T15:58:25",
  "outbound": 0,
  "loopback": 0,
  "last": null,
  "planes": []
};

