# Deploy

## GitHub

Após conclusão:

git add -A

git commit -m "descrição clara"

git push origin main

---

## Vercel

Deploy automático via push na branch main.

Validar sucesso do deploy.

Produção:

https://luka-psi-mocha.vercel.app

---

## Expo Go

Publicar:

npx eas-cli update --branch main --message "descrição"

Objetivos:

* Atualizar Expo Go
* Disponibilizar no iPhone
* Não depender de QR Code
* Não depender da mesma rede Wi-Fi

---

## Git — Workaround Sandbox (CRÍTICO)

O sandbox do Cowork não consegue fazer `git push` via HTTPS (sem credenciais).

**Solução obrigatória:** usar `.command` scripts executados pelo Finder no Mac do utilizador.

Fluxo:
1. Criar o script em `scripts/nome.command`
2. `chmod +x` via bash
3. Abrir Finder → pasta `scripts/` → duplo clique no ficheiro

Nunca tentar `git push` direto pelo bash do sandbox — vai falhar sempre.

---

## EAS Update — Configuração Correcta (CRÍTICO)

**Conta Expo:** `luizeduardompf.lixo@gmail.com` (login Google)

**`runtimeVersion` obrigatório:**
```json
"runtimeVersion": { "policy": "appVersion" }
```
Usar `sdkVersion` gera runtime `exposdk:54.0.0` que o Expo Go 54.0.2 **não reconhece** → "Not compatible".

**`newArchEnabled`:** manter `true` — Expo Go sempre usa New Architecture independentemente desta config.

**Splash screen:** não usar `react-native-reanimated` no splash — causa `Exception in HostFunction` no Expo Go. Usar `Animated` do React Native nativo.

**`eas-cli` sem sudo:** instalar sempre via `npx eas-cli` (não `npm install -g`).

**Publicar:**
```bash
npx eas-cli update --branch main --message "descrição"
```

---

## Fluxo Obrigatório

1. Atualizar versão
2. Testar
3. Commitar
4. Push
5. Validar Vercel
6. Publicar EAS Update
7. Confirmar atualização no Expo Go
