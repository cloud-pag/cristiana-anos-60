// === CONFIG ===
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/EXEMPLO_ALTERE_AQUI/pub?gid=0&single=true&output=csv";

const COLS = {
  nome: "Nome completo",
  acompanhantes: "Nº de acompanhantes",
  observacoes: "Observações",
  confirmacao: "Está confirmando presença?"
};

// === FIM DA CONFIG ===

const tabela = document.querySelector("#tabela tbody");
const totalAcompanhantes = document.getElementById("totalAcompanhantes");
const totalPessoas = document.getElementById("totalPessoas");
const searchInput = document.getElementById("search");
const exportBtn = document.getElementById("export");
const formEl = document.getElementById("rsvpForm");
const formLink = document.getElementById("formLink");
if (formEl && formLink) formLink.href = formEl.src;

function normalizaAcompanhantes(v){
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const n = String(v).replace(/[^0-9-]/g,"").trim();
  return n ? parseInt(n,10) : 0;
}

function render(data){
  tabela.innerHTML = "";
  let idx = 0, somaAcompanhantes = 0, somaPessoas = 0;

  data.forEach(row => {
    const conf = (row[COLS.confirmacao] || "").toString().toLowerCase();
    if (!conf.startsWith("s")) return; // mantém apenas 'Sim'

    const nome = row[COLS.nome] || "";
    const acompanhantes = normalizaAcompanhantes(row[COLS.acompanhantes]);
    const pessoas = 1 + (acompanhantes>0 ? acompanhantes : 0);
    const obs = row[COLS.observacoes] || "";

    idx++;
    somaAcompanhantes += acompanhantes;
    somaPessoas += pessoas;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx}</td>
      <td>${nome}</td>
      <td>${acompanhantes}</td>
      <td>${pessoas}</td>
      <td>${obs}</td>
    `;
    tabela.appendChild(tr);
  });

  totalAcompanhantes.textContent = somaAcompanhantes;
  totalPessoas.textContent = somaPessoas;
}

function filtra(){
  const q = searchInput.value.trim().toLowerCase();
  const rows = Array.from(tabela.querySelectorAll("tr"));
  rows.forEach(r => {
    const nome = (r.children[1]?.textContent || "").toLowerCase();
    r.style.display = nome.includes(q) ? "" : "none";
  });
}

function exportCSV(){
  // Gera CSV da tabela renderizada (visível) para baixar
  const rows = Array.from(tabela.querySelectorAll("tr")).filter(r => r.style.display !== "none");
  const head = ["#", "Nome", "Acompanhantes", "Total de pessoas", "Observações"];
  const lines = [head.join(";")];
  rows.forEach(r => {
    const cols = Array.from(r.children).map(td => `"${(td.textContent||"").replace(/"/g,'""')}"`);
    lines.push(cols.join(";"));
  });
  const blob = new Blob([lines.join("\n")], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lista_portaria.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function loadCSV(){
  if (!SHEET_CSV_URL.includes("http")) {
    console.warn("SHEET_CSV_URL não configurada. Edite script.js");
    return;
  }
  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    complete: (res) => {
      render(res.data || []);
    },
    error: (err) => {
      console.error("Erro lendo CSV:", err);
    }
  });
}

searchInput.addEventListener("input", filtra);
exportBtn.addEventListener("click", exportCSV);

// Start
loadCSV();
