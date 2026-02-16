```bash
node -e "for (let i = 0; i < 1e7; i++) process.stdout.write(\`[${i}] - Teste de arquivo grande\n\`)" > big-file.txt
```
