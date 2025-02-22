// esse arquivo explica como as funções funcionam para fazer upload e download de arquivos no amazon s3

import aws from 'aws-sdk';
import path from 'path';
import fs from 'fs';
import url from 'url'
import os from 'os'

aws.config.update({
    accessKeyId: 'CHAVE DE ACESSO',
    secretAccessKey: 'CHAVE DE ACESSO SECRETA',
    region: 'CODIGO DA REGIAO'
})

const s3 = new aws.S3()

const uploadfile = (filename) => {
    const filecontent = fs.readFileSync(filename)

    const params = {
        Bucket: 'NOME DO BUCKET',
        Key: path.basename(filename),
        Body: filecontent,
        ContentType: 'application/octet-stream'
    }

    s3.upload(params, (err,data) => {
        if (err){
            return console.log('erro ao fazer upload', err)
        }
        console.log('arquivo enviado com sucesso. url:', data.Location)
    })
}

//uploadfile("C:\\Users\\Ioshua\\Downloads\\Atividade 01 dev jogo I.pdf")

// Definir um caminho padrão para downloads
const userHome = os.homedir()
const defaultDownloadPath = path.join(userHome, 'Downloads'); // Altere para o seu caminho padrão

// Função para baixar o arquivo a partir da URL
const downloadFileFromUrl = (fileUrl) => {
    // Analisar a URL para obter o bucket e a chave do objeto
    const parsedUrl = url.parse(fileUrl);
    const bucketName = parsedUrl.hostname.split('.')[0]; // Extrai o nome do bucket
    const objectKey = decodeURIComponent(parsedUrl.pathname.slice(1)); // Extrai a chave do objeto

    const params = {
        Bucket: bucketName,
        Key: objectKey
    };

    // Definir o caminho de download usando o nome do arquivo do S3
    const downloadPath = path.join(defaultDownloadPath, path.basename(objectKey));

    const file = fs.createWriteStream(downloadPath);
    s3.getObject(params)
        .createReadStream()
        .on('error', (err) => {
            console.error('Erro ao baixar o arquivo:', err);
        })
        .pipe(file)
        .on('finish', () => {
            console.log(`Arquivo baixado com sucesso para: ${downloadPath}`);
        });
};

const fileUrl = 'https://ioshuauploadtestes.s3.sa-east-1.amazonaws.com/Atividade%2001%20dev%20jogo%20I.pdf';

downloadFileFromUrl(fileUrl);