let data = [];
let filteredData = [];
const RENDER_LIMIT = 300;

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const colFilter = document.getElementById("filterCollezione");
    const teamFilter = document.getElementById("filterSquadra");

    Papa.parse("catalogo.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        transformHeader: h => h.trim(),
        complete: function(results) {
            data = results.data.filter(r => r.ID);
            filteredData = data;

            populateFilters(data);
            renderTable(filteredData);
        }
    });

    function applyFilters() {
        const search = searchInput.value.toLowerCase().trim();
        const col = colFilter.value;
        const team = teamFilter.value;

        filteredData = data.filter(row => {
            const matchSearch =
                !search ||
                (row.Soggetto || "").toLowerCase().includes(search) ||
                (row.Squadra || "").toLowerCase().includes(search) ||
                (row.Numero || "").toString().includes(search);

            const matchCol = !col || row.Collezione === col;
            const matchTeam = !team || row.Squadra === team;

            return matchSearch && matchCol && matchTeam;
        });

        renderTable(filteredData);
    }

    searchInput.addEventListener("input", applyFilters);
    colFilter.addEventListener("change", applyFilters);
    teamFilter.addEventListener("change", applyFilters);
});

function populateFilters(data) {
    const colSet = new Set();
    const teamSet = new Set();

    data.forEach(r => {
        if (r.Collezione) colSet.add(r.Collezione);
        if (r.Squadra) teamSet.add(r.Squadra);
    });

    const colFilter = document.getElementById("filterCollezione");
    const teamFilter = document.getElementById("filterSquadra");

    colSet.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        colFilter.appendChild(opt);
    });

    teamSet.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        teamFilter.appendChild(opt);
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
        `;

        tbody.appendChild(tr);
    });
}
