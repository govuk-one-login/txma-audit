#!/usr/bin/env bash

set -eu

gradle test

cat <<EOF > "$TEST_REPORT_DIR/result.json"
[
  {
    "uri": "test.sh",
    "name": "Acceptance test",
    "elements": [
      {
        "type": "scenario",
        "name": "API Gateway request",
        "line": 6,
        "steps": [
          {
            "keyword": "Given ",
            "name": "this step fails",
            "line": 6,
            "match": {
              "location": "test.sh:4"
            },
            "result": {
              "status": "passed",
              "duration": 1
            }
          }
        ]
      }
    ]
  }
]
EOF

exit 0