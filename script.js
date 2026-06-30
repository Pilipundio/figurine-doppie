let data = [];
let filteredData = [];
const RENDER_LIMIT = 400;

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");

    Papa.parse("catalogo.csv?v=" + Date.now(), {
        download: true,
        header: true,
        skipEmptyLines: true,
        transformHeader: h => h.trim(),
        complete: function(results) {
            data = results.data.filter(r => r.ID);
            filteredData = data;

            buildFilters(data);
            renderTable(filteredData);
        },
        error: function(err) {
            console.error("ERRORE CSV:", err);
        }
    });

    let timeout;

    searchInput.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(applyFilters, 120);
    });

    document.getElementById("filterCollezione").addEventListener("change", applyFilters);
    document.getElementById("filterSquadra").addEventListener("change", applyFilters);
    document.getElementById("filterTipologia").addEventListener("change", applyFilters);
    document.getElementById("filterEditore").addEventListener("change", applyFilters);
    document.getElementById("filterAnno").addEventListener("change", applyFilters);
});

function applyFilters() {
    const search = document.getElementById("search").value.toLowerCase().trim();

    const col = document.getElementById("filterCollezione").value;
    const team = document.getElementById("filterSquadra").value;
    const tipo = document.getElementById("filterTipologia").value;
    const editore = document.getElementById("filterEditore").value;
    const anno = document.getElementById("filterAnno").value;

    filteredData = data.filter(row => {
        const matchSearch =
            !search ||
            (row.Soggetto || "").toLowerCase().includes(search) ||
            (row.Squadra || "").toLowerCase().includes(search) ||
            (row.Collezione || "").toLowerCase().includes(search) ||
            (row.Numero || "").toString().includes(search);

        return (
            matchSearch &&
            (!col || row.Collezione === col) &&
            (!team || row.Squadra === team) &&
            (!tipo || row.Tipologia === tipo) &&
            (!editore || row.Editore === editore) &&
            (!anno || row.Anno === anno)
        );
    });

    renderTable(filteredData);
}

function buildFilters(data) {
    fillSelect("filterCollezione", extract(data, "Collezione"));
    fillSelect("filterSquadra", extract(data, "Squadra"));
    fillSelect("filterTipologia", extract(data, "Tipologia"));
    fillSelect("filterEditore", extract(data, "Editore"));
    fillSelect("filterAnno", extract(data, "Anno"));
}

function extract(data, key) {
    const set = new Set();
    data.forEach(r => {
        if (r[key]) set.add(r[key]);
    });
    return [...set].sort();
}

function fillSelect(id, values) {
    const select = document.getElementById(id);

    values.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
    });
}

function renderTable(rows) {
    const tbody = document.querySelector("#table tbody");
    tbody.innerHTML = "";

    const slice = rows.slice(0, RENDER_LIMIT);

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < slice.length; i++) {
        const r = slice[i];

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${r.ID || ""}</td>
            <td>${r.Gruppo || ""}</td>
            <td>${r.Collezione || ""}</td>
            <td>${r.Editore || ""}</td>
            <td>${r.Anno || ""}</td>
            <td>${r.Tipologia || ""}</td>
            <td>${r.Numero || ""}</td>
            <td>${r.Soggetto || ""}</td>
            <td>${r.Squadra || ""}</td>
            <td>${r.Condizione || ""}</td>
            <td>${r.Quantità || ""}</td>
            <td>${r.Note || ""}</td>
            <td>${r.Rarità || ""}</td>
        `;

        fragment.appendChild(tr);
    }

    tbody.appendChild(fragment);
}
