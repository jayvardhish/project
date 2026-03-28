const { execSync } = require('child_process');
try {
  const output = execSync('netlify api getSite --data "{\\"site_id\\": \\"72f3ee9f-3ec2-4a72-9735-9aa8d9edff06\\"}"');
  const data = JSON.parse(output.toString());
  console.log("URL:", data.url);
  console.log("SSL:", data.ssl_url);
} catch (e) {
  console.error(e.message);
}
