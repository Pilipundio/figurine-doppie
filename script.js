let data = [];
let filteredData = [];
const RENDER_LIMIT = 300;

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("#table tbody");
    const searchInput = document.getElementById("search");

    Papa.parse("catalogo.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            data = results.data.filter(r => r.ID); // pulizia base
            filteredData = data;
            renderTable(filteredData);
        },
        error: function(err) {
            console.error("Errore CSV:", err);
        }
    });

    let timeout;

    searchInput.addEventListener("input", (e) => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            const value = e.target.value.toLowerCase().trim();

            if (value.length < 2) {
                filteredData = data;
            } else {
                filteredData = data.filter(row =>
                    matchRow(row, value)
                );
            }

            renderTable(filteredData);
        }, 150);
    });
});

function matchRow(row, value) {
    return (
        (row.Soggetto || "").toLowerCase().includes(value) ||
        (row.Squadra || "").toLowerCase().includes(value) ||
        (row.Collezione || "").toLowerCase().includes(value) ||
        (row.Numero || "").toString().toLowerCase().includes(value) ||
        (row.Anno || "").toString().includes(value)
    );
}

function renderTable(rows) {
    const tbody = document.querySelector("#table tbody");
    tbody.innerHTML = "";

    const slice = rows.slice(0, RENDER_LIMIT);
    const fragment = document.createDocumentFragment();

    slice.forEach(row => {
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

    // feedback minimo
    const info = document.createElement("tr");
    info.innerHTML = `
        <td colspan="7" style="text-align:center; font-weight:bold; background:#f0f0f0;">
            Mostrate ${slice.length} / ${rows.length} righe
        </td>
    `;
    tbody.appendChild(info);
}
