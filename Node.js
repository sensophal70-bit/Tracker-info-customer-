const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// កំណត់ Folder សម្រាប់ទុក File បណ្ដោះអាសន្ន
const downloadFolder = path.join(__dirname, 'public_reports');
if (!fs.existsSync(downloadFolder)) fs.mkdirSync(downloadFolder);
app.use('/get-file', express.static(downloadFolder));

app.post('/hybrid-export', async (req, res) => {
    const { user_id, data, user_name } = req.body;

    try {
        const fileName = `Report_${uuidv4().substring(0, 8)}.xlsx`;
        const filePath = path.join(downloadFolder, fileName);

        // ១. បង្កើតឯកសារ Excel
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('សកម្មភាពចុះវាល');
        sheet.columns = [
            { header: 'ល.រ', key: 'id', width: 10 },
            { header: 'កាលបរិច្ឆេទ', key: 'date', width: 15 },
            { header: 'អាសយដ្ឋាន', key: 'address', width: 50 },
            { header: 'GPS', key: 'gps', width: 25 }
        ];
        data.forEach(item => sheet.addRow(item));
        await workbook.xlsx.writeFile(filePath);

        // ២. ផ្ញើចូល Telegram Bot (Backup)
        await bot.sendDocument(user_id, filePath, {
            caption: `📊 របាយការណ៍សម្រាប់៖ ${user_name || 'អ្នកប្រើប្រាស់'}\n\n✅ ឯកសារត្រូវបានរក្សាទុកក្នុង Cloud រួចរាល់។`
        });

        // ៣. បញ្ជូន Direct Link ត្រឡប់ទៅ Mini App វិញ
        const directLink = `https://your-server.com/get-file/${fileName}`;
        res.json({ success: true, downloadUrl: directLink });

        // លុប File ចោលក្រោយ ១៥ នាទី
        setTimeout(() => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, 15 * 60 * 1000);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error processing report" });
    }
});

app.listen(3000, () => console.log('Hybrid Server running on port 3000'));
