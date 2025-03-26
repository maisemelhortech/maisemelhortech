export async function InvokeLLM({ prompt, response_json_schema }) {
  console.log("Solicitação para LLM:", prompt);
  
  // Gera um hash alfanumérico de 20 caracteres para qualquer prompt
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let hash = '';
  for (let i = 0; i < 25; i++) {
    hash += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return { hash };
}

export async function UploadFile({ file }) {
  console.log("Simulando upload de arquivo:", file?.name || "arquivo sem nome");
  return { file_url: "https://example.com/arquivo-simulado.pdf" };
}

export async function ExtractDataFromUploadedFile({ file_url, json_schema }) {
  console.log("Simulando extração de dados do arquivo:", file_url);
  return {
    status: "success",
    details: null,
    output: {} // Dados fictícios
  };
}