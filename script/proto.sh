#!/bin/bash

set -e
set -o errexit
set -o pipefail

# shellcheck disable=SC2128
ROOT="$(dirname "${BASH_SOURCE}")/.."

PROTOC_GEN_TS_PATH="${ROOT}/node_modules/.bin/protoc-gen-ts"
PROTOC_GEN_GRPC_PATH="${ROOT}/node_modules/.bin/grpc_tools_node_protoc_plugin"
OUT_DIR="${ROOT}/proto-api/"

PROTO_DIR="${ROOT}/"
if [[ -d "$PROTO_DIR" ]];
then
    echo "generating from ${PROTO_DIR}"
else
    echo "${PROTO_DIR} not found, please symlink first"
    exit 1
fi

PROTO_FILES=$(find "$PROTO_DIR" -maxdepth 1 -name '*.proto')

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

gen_code() {
    echo "processing $1"
    protoc \
        --proto_path="${PROTO_DIR}" \
        --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
        --plugin=protoc-gen-grpc=${PROTOC_GEN_GRPC_PATH} \
        --js_out="import_style=commonjs,binary:${OUT_DIR}" \
        --ts_out="service=grpc-node:${OUT_DIR}" \
        --grpc_out="grpc_js:${OUT_DIR}" \
        "$1"
}

for f in ${PROTO_FILES}; do
    gen_code "$f"
done
