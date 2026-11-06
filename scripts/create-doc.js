const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun } = require("docx");

const studentCode = process.argv[2] || "QE200012";
const fullName = process.argv[3] || "Nguyen Van A";
const vercelUrl = process.argv[4] || "https://pefer.vercel.app";
const outDir = process.argv[5] || path.join(__dirname, "..", "submit");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const lines = [
  `Student Code: ${studentCode}`,
  `Full Name: ${fullName}`,
  `GitHub Repository URL: https://github.com/Trung270806/pefer`,
  `Vercel Production URL: ${vercelUrl}`,
  `Supabase Project URL: https://ljtfimeoecxehzyabwjg.supabase.co`,
  `Supabase anon (public) key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdGZpbWVvZWN4ZWh6eWFid2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NzExNTUsImV4cCI6MjEwOTI0NzE1NX0.u8EVo0YgXJv07Wg6fLZJVgiMb6Ea6TTKYVoVGAPP_XM`,
  `Test account email: grader.${studentCode.toLowerCase()}@example.com`,
  `Test account password: Test1234!`,
];

const doc = new Document({
  sections: [
    {
      properties: {},
      children: lines.map(
        (line) =>
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                font: "Calibri",
                size: 24, // 12pt
              }),
            ],
            spacing: {
              after: 120, // 6pt
            },
          })
      ),
    },
  ],
});

const filePath = path.join(outDir, `${studentCode}.docx`);

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(filePath, buffer);
  console.log(`Da tao file word thanh cong: ${filePath}`);
});
