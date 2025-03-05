const { jsPDF } = require("jspdf");
require("jspdf-autotable");

let decimales = 4;

function falsePositionMethod(func, xi, xs) {
    if (func(xi) * func(xs) >= 0) {
        throw new Error("El Teorema de Bolzano no se cumple: f(xi) y f(xs) deben tener signos opuestos.");
    }

    let xr_old = xi;
    let error = 100; 
    let iter = 0;
    let table = [];
    let procedures = [];
    const margenError = 0.005; 

    const round = (num) => parseFloat(num.toFixed(decimales));

    console.log("Iter\t xi\t\t xs\t\t xr\t\t f(xi)\t\t f(xs)\t\t f(xr)\t\t Error");

    while (error > margenError) {
        iter++;
        let f_xi = round(exampleFunction(xi));
        let f_xs = round(exampleFunction(xs));
        let xr = round(xs - (f_xs * (xi - xs)) / (f_xi - f_xs));
        let f_xr = round(exampleFunction(xr));

        error = round(Math.abs((xr - xr_old) / xr) * 100);
        
        console.log(`${iter}\t ${xi}\t ${xs}\t ${xr}\t ${f_xi}\t ${f_xs}\t ${f_xr}\t ${error}`);

        table.push({
            iter,
            xi: xi,
            xs: xs,
            xr: xr,
            f_xi: f_xi,
            f_xs: f_xs,
            f_xr: f_xr,
            error: error,
        });

        procedures.push(`Iteración ${iter}\nxi = ${xi}, xs = ${xs}\nxr = ${xr}\nf(xi) = ${f_xi}, f(xs) = ${f_xs}, f(xr) = ${f_xr}\nError = ${error} %\n`);

        if (error <= margenError) {  
            console.log("✅ Se encontró la raíz aproximada en xr =", xr);
            exportToPDF(table, procedures, xr);
            return;
        }

        if (f_xi * f_xr < 0) {
            xs = xr;
        } else {
            xi = xr;
        }

        xr_old = xr;  
    }
}

// Exportar resultados a PDF
function exportToPDF(table, procedures, raizAprox) {
    const doc = new jsPDF();
    let y = 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Método de Regla Falsa", 75, y);
    doc.text("Integrantes: Joan Caselles Y Samir Rodriguez", 80, 20);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Raíz Aproximada: ${raizAprox}`, 10, y);
    y += 10;

    doc.setFontSize(10);
    doc.text("Procedimiento detallado:", 10, y);
    y += 5;

    doc.setFont("helvetica", "normal");

    procedures.forEach((proc, index) => {
        doc.text(proc, 10, y);
        y += 20;
        if (y > 260) {
            doc.addPage();
            y = 10;
        }
    });

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Tabla de Iteraciones:", 10, y);
    y += 5;

    doc.autoTable({
        startY: y,
        head: [["Iteración", "xi", "xs", "xr", "f(xi)", "f(xs)", "f(xr)", "Error"]],
        body: table.map(row => Object.values(row)),
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
    });

    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const filename = `Regla_falsa_resultados${timestamp}.pdf`;

    doc.save(filename);
}

// Función de ejemplo
function exampleFunction(x) {
    return 4.9*x**2 -43.3013*x+20;
}

// Intervalo de inicio
let xi = 0, xs = 1;

// Llamada a la función
falsePositionMethod(exampleFunction, xi, xs);
