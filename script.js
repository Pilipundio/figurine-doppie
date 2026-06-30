let data = [];
let filteredData = [];
let currentSort = { key: null, direction: 1 };
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
            attachSorting();
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

function attachSorting() {
    const headers = document.querySelectorAll("th");

    headers.forEach((th, index) => {
        th.style.cursor = "pointer";

        th.addEventListener("click", () => {
            const keys = [
                "ID",
                "Gruppo",
                "Collezione",
                "Editore",
                "Anno",
                "Tipologia",
                "Numero",
                "Soggetto",
                "Squadra",
                "Condizione",
                "Quantità",
                "Note",
                "Rarità"
            ];

            const key = keys[index];
            if (!key) return;

            if (currentSort.key === key) {
                currentSort.direction *= -1;
            } else {
                currentSort.key = key;
                currentSort.direction = 1;
            }

            sortData(key, currentSort.direction);
            renderTable(filteredData);
        });
    });
}

function sortData(key, direction) {
    filteredData.sort((a, b) => {
        const valA = (a[key] || "").toString();
        const valB = (b[key] || "").toString();

        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
            return (numA - numB) * direction;
        }

        return valA.localeCompare(valB) * direction;
    });
}

function renderTable(rows) {
    const tbody = document.querySelector("#table tbody");
    tbody.innerHTML = "";

    rows.slice(0, RENDER_LIMIT).forEach(row => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${row.ID || ""}</td>
            <td>${row.Gruppo || ""}</td>
            <td>${row.Collezione || ""}</td>
            <td>${row.Editore || ""}</td>
            <td>${row.Anno || ""}</td>
            <td>${row.Tipologia || ""}</td>
            <td>${row.Numero || ""}</td>
            <td>${row.Soggetto || ""}</td>
            <td>${row.Squadra || ""}</td>
            <td>${row.Condizione || ""}</td>
            <td>${row.Quantità || ""}</td>
            <td>${row.Note || ""}</td>
            <td>${row.Rarità || ""}</td>
        `;

        tbody.appendChild(tr);
    });
}
