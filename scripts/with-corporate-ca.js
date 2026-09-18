#!/usr/bin/env node
// Encaminha para o comando Next.js normalmente, mas só injeta o certificado
// raiz corporativo (Kaspersky) quando ele existe E não estamos rodando em
// produção na Vercel (que define VERCEL=1 automaticamente). Sem isso, o
// build/deploy em produção não deve depender desse certificado de rede
// interna — ele existe só para contornar a inspeção de TLS do Kaspersky em
// redes corporativas durante o desenvolvimento local.
const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join } = require("node:path");

const certPath = join(__dirname, "..", ".certs", "kaspersky-root-ca.pem");
const env = { ...process.env };

if (!process.env.VERCEL && !process.env.CI && existsSync(certPath)) {
  env.NODE_EXTRA_CA_CERTS = certPath;
}

const [command, ...args] = process.argv.slice(2);
const result = spawnSync(command, args, { stdio: "inherit", env, shell: process.platform === "win32" });
process.exit(result.status ?? 1);
