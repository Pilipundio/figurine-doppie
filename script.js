let data = [];

document.addEventListener("DOMContentLoaded", () => {
    console.log("Figurine Doppie avviato");

    Papa.parse("catalogo.csv", {
        download: true,
        header: true,
        complete: function(results) {
            data = results.data;
            renderTable(data);
        }
    });

    document.getElementById("search").addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase();

        const filtered = data.filter(row =>
            Object.values(row).some(v =>
                (v || "").toString().toLowerCase().includes(value)
            )
        );

        renderTable(filtered);
    });
});

function renderTable(rows) {
    const tbody = document.querySelector("#table tbody");
    tbody.innerHTML = "";

    rows.forEach(row => {
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

        tbody.appendChild(tr);
    });
}
