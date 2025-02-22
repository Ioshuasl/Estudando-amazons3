//explica como funcionam as rotas para fazer upload e downlaod de arquivos no amazon s3

import express from 'express'
import aws from 'aws-sdk';
import path from 'path';
import fs from 'fs';
import os from 'os'
import multer from 'multer'

// Configurar as credenciais da AWS
aws.config.update({
    accessKeyId: 'CHAVE DE ACESSO',
    secretAccessKey: 'CHAVE DE ACESSO SECRETA',
    region: 'CODIGO DA REGIAO'
})

// Criar uma instância do S3
const s3 = new aws.S3();
const app = express();
const port = 3000;

// Configurar o multer para armazenar arquivos temporariamente
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rota para upload de arquivos
// requisição post localhost:PORTA/upload seleciona o body form-data key voce vai digitar file e deois selecionar sua imagem
app.post('/upload', upload.single('file'), (req, res) => {
    const fileContent = req.file.buffer; // O conteúdo do arquivo
    const params = {
        Bucket: 'NOME DO SEU BUCKET',
        Key: req.file.originalname, // Nome do arquivo no S3
        Body: fileContent,
        ContentType: req.file.mimetype // Tipo de conteúdo do arquivo
    };

    s3.upload(params, (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao fazer upload: ' + err);
        }
        res.send(`Arquivo enviado com sucesso. URL: ${data.Location}`);
    });
});

// Rota para download de arquivos
// requisição get localhost:PORTA/download?url=LINK DO ARQUIVO DENTRO DO S3 QUE VOCE QUER INSTALAR
app.get('/download', (req, res) => {
    const fileUrl = req.query.url; // URL do arquivo no S3

    // Analisar a URL para obter o bucket e a chave do objeto
    const parsedUrl = new URL(fileUrl);
    const bucketName = parsedUrl.hostname.split('.')[0]; // Extrai o nome do bucket
    const objectKey = decodeURIComponent(parsedUrl.pathname.slice(1)); // Extrai a chave do objeto

    const params = {
        Bucket: bucketName,
        Key: objectKey
    };

    // Definir o caminho de download usando o nome do arquivo do S3
    const downloadPath = path.join(os.homedir(), 'Downloads', path.basename(objectKey));

    const file = fs.createWriteStream(downloadPath);
    s3.getObject(params)
        .createReadStream()
        .on('error', (err) => {
            console.error('Erro ao baixar o arquivo:', err);
            return res.status(500).send('Erro ao baixar o arquivo: ' + err);
        })
        .pipe(file)
        .on('finish', () => {
            res.send(`Arquivo baixado com sucesso para: ${downloadPath}`);
        });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});