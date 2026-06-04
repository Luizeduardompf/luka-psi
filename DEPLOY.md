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

## Fluxo Obrigatório

1. Atualizar versão
2. Testar
3. Commitar
4. Push
5. Validar Vercel
6. Publicar EAS Update
7. Confirmar atualização no Expo Go
