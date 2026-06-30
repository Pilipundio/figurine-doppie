let data = [];
let filteredData = [];
const RENDER_LIMIT = 300;

document.addEventListener("DOMContentLoaded", () => {
    Papa.parse("catalogo.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            data = results.data;
            filteredData = data;
            renderTable(filteredData);
        }
    });

    const searchInput = document.getElementById("search");

    let timeout;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            const value = e.target.value.toLowerCase().trim();

            if (value.length < 2) {
                filteredData = data;
            } else {
                filteredData = data.filter(row =>
                    (row.Soggetto || "").toLowerCase().includes(value) ||
                    (row.Squadra || "").toLowerCase().includes(value) ||
                    (row.Collezione || "").toLowerCase().includes(value) ||
                    (row.Numero || "").toString().toLowerCase().includes(value)
                );
            }

            renderTable(filteredData);
        }, 150);
    });
});

function renderTable(rows) {
    const tbody = document.querySelector("#table tbody");
    tbody.innerHTML = "";

    const fragment = document.createDocumentFragment();

    rows.slice(0, RENDER_LIMIT).forEach(row => {
        if (!row.ID) return;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${row.Soggetto || ""}</td>
            <td>${row.Squadra || ""}</td>
            <td>${row.Collezione || ""}</td>
            <td>${row.Anno || ""}</td>
            <td>${row.Numero || ""}</td>
            <td>${row.Quantità || ""}</td>
            <td>${row.Condizione || ""}</td>
        `;

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}
