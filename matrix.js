/**
 * Matrix of Destiny Functionality
 * Handles form submission on matrix.html and rendering on matrix-result.html
 */

document.addEventListener('DOMContentLoaded', () => {
    const matrixForm = document.getElementById('matrixForm');
    const matrixSvg = document.getElementById('svg');

    if (matrixForm) initMatrixForm(matrixForm);
    if (matrixSvg) initMatrixResult();
});

function initMatrixForm(form) {
    const input = document.getElementById('dateInput');
    const datalist = document.getElementById('recentDates');

    // 1. Load history
    let history = JSON.parse(localStorage.getItem('matrix_history') || '[]');
    function updateDatalist() {
        if (!datalist) return;
        datalist.innerHTML = '';
        // Show last 5 unique dates
        history.slice().reverse().forEach(date => {
            const opt = document.createElement('option');
            opt.value = date;
            datalist.appendChild(opt);
        });
    }
    updateDatalist();

    // 2. Simple masking (DD.MM.YYYY)
    if (input) {
        input.addEventListener('input', function (e) {
            let v = this.value.replace(/\D/g, ''); // Remove non-digits
            if (v.length > 8) v = v.substring(0, 8);

            // Format to DD.MM.YYYY
            let formatted = '';
            if (v.length > 0) formatted += v.substring(0, 2);
            if (v.length > 2) formatted += '.' + v.substring(2, 4);
            if (v.length > 4) formatted += '.' + v.substring(4, 8);

            this.value = formatted;
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const val = (input?.value || '').trim();

        // Validate format DD.MM.YYYY
        const parts = val.split('.');
        if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
            alert('Пожалуйста, введите дату в формате ДД.ММ.ГГГГ');
            input?.focus();
            return;
        }

        const [d, m, y] = parts;
        const isoDate = `${y}-${m}-${d}`;

        // Save to history
        // 1. Remove if exists to move it to the end (most recent)
        history = history.filter(h => h !== val);
        // 2. Add as most recent
        history.push(val);
        // 3. Keep only last 3
        if (history.length > 3) history = history.slice(-3);

        localStorage.setItem('matrix_history', JSON.stringify(history));
        localStorage.setItem('matrix_last_date', val);

        window.location.href = `matrix-result.html?date=${encodeURIComponent(isoDate)}`;
    });
}

function initMatrixResult() {
    function reduce(n) {
        while (n > 22) {
            n = String(n).split('').reduce((a, b) => a + +b, 0);
        }
        return n;
    }

    function getDateFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get("date");
    }

    const dateStr = getDateFromURL();
    if (!dateStr) return;

    // ————— DATE & AGE —————
    const [yearStr, monthStr, dayStr] = dateStr.split("-");
    const birthDate = new Date(yearStr, monthStr - 1, dayStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const mDiff = today.getMonth() - birthDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) age--;

    const ageWord = (age % 10 === 1 && age % 100 !== 11) ? "год"
        : ([2, 3, 4].includes(age % 10) && ![12, 13, 14].includes(age % 100))
            ? "года" : "лет";

    const label = document.getElementById("birthdate-label");
    if (label) {
        label.innerHTML = `
            <div class="date-display">${dayStr}.${monthStr}.${yearStr}</div>
            <div class="age-display">${age} ${ageWord}</div>
        `;
    }

    // ————— CALCULATION —————
    const day = +dayStr, month = +monthStr, year = +yearStr;
    const rDay = reduce(day);
    const rMonth = reduce(month);
    const rYear = reduce(yearStr.split("").reduce((a, b) => a + +b, 0));
    const sumAll = reduce(rDay + rMonth + rYear);
    const centerValue = reduce(rDay + rMonth + rYear + sumAll);

    const values = [rDay, reduce(rDay + rMonth), rMonth, reduce(rMonth + rYear), rYear, reduce(rYear + sumAll), sumAll, reduce(sumAll + rDay)];
    // Indices: 0:Left, 1:TL, 2:Top, 3:TR, 4:Right, 5:BR, 6:Bottom, 7:BL

    const U = values.map(v => reduce(v + centerValue));

    const Y = values.map((v, idx) => reduce(v + U[idx]));

    // ————— POPULATE HEALTH TABLE —————
    // Mapped as per user request:
    // Sahasrara Body (Left) = rDay
    // Sahasrara Energy (Top) = rMonth
    // Manipura Body (Center) = centerValue
    // Manipura Energy (Center) = centerValue
    // Muladhara Body (Right) = rYear
    // Muladhara Energy (Bottom) = sumAll (rDay + rMonth + rYear)

    // Helper to set cell text safely
    const setCell = (selector, val) => {
        const el = document.querySelector(selector);
        if (el) el.childNodes[0].nodeValue = val; // Only change text node, keep children (tooltip)
    };

    // Sahasrara (Purple)
    const rowPurple = document.querySelector('.row-purple');
    if (rowPurple) {
        rowPurple.children[0].textContent = rDay;      // Body
        rowPurple.children[1].textContent = rMonth;    // Energy
        rowPurple.children[2].textContent = reduce(rDay + rMonth); // Emotion
    }

    // Ajna (Blue)
    const rowBlue = document.querySelector('.row-blue');
    if (rowBlue) {
        rowBlue.children[0].textContent = Y[0];      // Body
        rowBlue.children[1].textContent = Y[2];      // Energy
        rowBlue.children[2].textContent = reduce(Y[0] + Y[2]); // Emotion
    }

    // Vishuddha (Cyan)
    const rowCyan = document.querySelector('.row-cyan');
    if (rowCyan) {
        rowCyan.children[0].textContent = U[0];      // Body
        rowCyan.children[1].textContent = U[2];      // Energy
        rowCyan.children[2].textContent = reduce(U[0] + U[2]); // Emotion
    }

    // Anahata (Green) - midU calculation
    const midU1 = reduce(U[0] + centerValue);
    const midU2 = reduce(U[2] + centerValue);

    const rowGreen = document.querySelector('.row-green');
    if (rowGreen) {
        rowGreen.children[0].textContent = midU1;    // Body
        rowGreen.children[1].textContent = midU2;    // Energy
        rowGreen.children[2].textContent = reduce(midU1 + midU2); // Emotion
    }

    // Manipura (Yellow)
    const rowYellow = document.querySelector('.row-yellow');
    if (rowYellow) {
        rowYellow.children[0].textContent = centerValue; // Body
        rowYellow.children[1].textContent = centerValue; // Energy
        rowYellow.children[2].textContent = reduce(centerValue + centerValue); // Emotion
    }

    // Svadhisthana (Orange)
    const rowOrange = document.querySelector('.row-orange');
    if (rowOrange) {
        rowOrange.children[0].textContent = U[4];      // Body
        rowOrange.children[1].textContent = U[6];      // Energy
        rowOrange.children[2].textContent = reduce(U[4] + U[6]); // Emotion
    }

    // Muladhara (Red)
    const rowRed = document.querySelector('.row-red');
    if (rowRed) {
        rowRed.children[0].textContent = rYear;   // Body
        rowRed.children[1].textContent = sumAll; // Energy
        rowRed.children[2].textContent = reduce(rYear + sumAll); // Emotion
    }

    // ————— SUM & TOTAL ROWS —————

    // Column Sums (Simple Arithmetic)
    const sumBody = rDay + Y[0] + U[0] + midU1 + centerValue + U[4] + rYear;
    const sumEnergy = rMonth + Y[2] + U[2] + midU2 + centerValue + U[6] + sumAll;
    const sumEmotion = reduce(rDay + rMonth) + reduce(Y[0] + Y[2]) + reduce(U[0] + U[2]) +
        reduce(midU1 + midU2) + reduce(centerValue + centerValue) +
        reduce(U[4] + U[6]) + reduce(rYear + sumAll);

    // Sum Row (Arithmetic Sum)
    const rowSum = document.querySelector('.row-sum');
    if (rowSum) {
        rowSum.children[0].textContent = sumBody;
        rowSum.children[1].textContent = sumEnergy;
        rowSum.children[2].textContent = sumEmotion;
    }

    // Total Row (Reduced Sum)
    const rowTotal = document.querySelector('.row-total');
    if (rowTotal) {
        rowTotal.children[0].textContent = reduce(sumBody);
        rowTotal.children[1].textContent = reduce(sumEnergy);
        rowTotal.children[2].textContent = reduce(sumEmotion);
    }

    // ————— DESTINY BLOCK —————
    // Sky = values[2] (Top) + values[6] (Bottom)
    const valSky = reduce(values[2] + values[6]);
    setCell("#val-sky", valSky);

    // Earth = values[0] (Left) + values[4] (Right)
    const valEarth = reduce(values[0] + values[4]);
    setCell("#val-earth", valEarth);

    // Personal = Sky + Earth
    const valPersonal = reduce(valSky + valEarth);
    setCell("#val-personal-total", valPersonal);

    // Social Male (M) = values[1] (Top-Left) + values[5] (Bottom-Right)
    const valMale = reduce(values[1] + values[5]);
    setCell("#val-male", valMale);

    // Social Female (F) = values[3] (Top-Right) + values[7] (Bottom-Left)
    const valFemale = reduce(values[3] + values[7]);
    setCell("#val-female", valFemale);

    // Social Total = M + Ж
    const valSocialTotal = reduce(valMale + valFemale);
    setCell("#val-social-total", valSocialTotal);

    // Spiritual = Personal + Social
    const valSpiritual = reduce(valPersonal + valSocialTotal);
    setCell("#val-spiritual", valSpiritual);

    // Planetary = Social + Spiritual
    const valPlanetary = reduce(valSocialTotal + valSpiritual);
    setCell("#val-planetary", valPlanetary);

    // Ancestral Power = values[1] + values[3] + values[5] + values[7]
    const valAncestralPower = reduce(values[1] + values[3] + values[5] + values[7]);
    setCell("#val-ancestral-power", valAncestralPower);

    // Male Code = values[1], values[5], reduce(values[1] + values[5])
    const maleCode = `${values[1]}, ${values[5]}, ${reduce(values[1] + values[5])}`;
    setCell("#val-male-code", maleCode);

    // Female Code = values[3], values[7], reduce(values[3] + values[7])
    const femaleCode = `${values[3]}, ${values[7]}, ${reduce(values[3] + values[7])}`;
    setCell("#val-female-code", femaleCode);

    // Internal Power Code = centerValue, valAncestralPower, reduce(centerValue + valAncestralPower)
    const internalCode = `${centerValue}, ${valAncestralPower}, ${reduce(centerValue + valAncestralPower)}`;
    setCell("#val-internal-code", internalCode);

    // ————— SVG SETUP —————
    const svg = document.getElementById("svg");
    svg.innerHTML = "";
    const width = 700, height = 700, cx = 350, cy = 350, radius = 270;

    // Angles for indices 0-7. 0 is Left (PI).
    // 0: Left (PI), 1: TL (5/4 PI), 2: Top (3/2 PI), 3: TR (7/4 PI), 4: Right (0), 5: BR (1/4 PI), 6: Bottom (1/2 PI), 7: BL (3/4 PI)
    const angles = [
        Math.PI,           // 0: Left
        Math.PI * 5 / 4,   // 1: Top-Left
        Math.PI * 3 / 2,   // 2: Top
        Math.PI * 7 / 4,   // 3: Top-Right
        0,                 // 4: Right
        Math.PI / 4,       // 5: Bottom-Right
        Math.PI / 2,       // 6: Bottom
        Math.PI * 3 / 4    // 7: Bottom-Left
    ];

    const outerPoints = [];
    const uPoints = [];
    const innerRadius2 = 197;

    // Generate Points
    for (let i = 0; i < 8; i++) {
        outerPoints.push({
            x: cx + radius * Math.cos(angles[i]),
            y: cy + radius * Math.sin(angles[i])
        });
        uPoints.push({
            x: cx + innerRadius2 * Math.cos(angles[i]),
            y: cy + innerRadius2 * Math.sin(angles[i])
        });
    }

    // Layers
    const lineLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const nodeLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const textLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.append(lineLayer, nodeLayer, textLayer);

    // ————— HELPERS —————
    function drawGenericLine(p1, p2, col, width = 2, opacity = 0.5) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.x); line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x); line.setAttribute("y2", p2.y);
        line.setAttribute("stroke", col); line.setAttribute("stroke-width", width);
        line.setAttribute("opacity", opacity);
        lineLayer.appendChild(line);
    }

    function connectNodes(idx1, idx2, pts, offsetR = 22, col = "#888", width = 2, opacity = 0.5) {
        const p1 = pts[idx1], p2 = pts[idx2];
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const start = { x: p1.x + offsetR * Math.cos(angle), y: p1.y + offsetR * Math.sin(angle) };
        const end = { x: p2.x - offsetR * Math.cos(angle), y: p2.y - offsetR * Math.sin(angle) };
        drawGenericLine(start, end, col, width, opacity);
    }

    // ————— DRAW SQUARES —————
    // 1. Personal Square (Diamond): 0-2-4-6
    connectNodes(0, 2, outerPoints); connectNodes(2, 4, outerPoints);
    connectNodes(4, 6, outerPoints); connectNodes(6, 0, outerPoints);

    // 2. Ancestral Square: 1-3-5-7
    connectNodes(1, 3, outerPoints); connectNodes(3, 5, outerPoints);
    connectNodes(5, 7, outerPoints); connectNodes(7, 1, outerPoints);

    // 2.5 MAIN AXES (Horizontal & Vertical)
    connectNodes(0, 4, outerPoints); // Left to Right
    connectNodes(2, 6, outerPoints); // Top to Bottom

    // 3. Inner Personal Square (U 0-2-4-6) - REMOVED
    // connectNodes(0, 2, uPoints, 15, "#888", 2, 0.5); connectNodes(2, 4, uPoints, 15, "#888", 2, 0.5);
    // connectNodes(4, 6, uPoints, 15, "#888", 2, 0.5); connectNodes(6, 0, uPoints, 15, "#888", 2, 0.5);

    // 4. Inner Ancestral Square (U 1-3-5-7) - REMOVED
    // connectNodes(1, 3, uPoints, 15, "#888", 2, 0.5); connectNodes(3, 5, uPoints, 15, "#888", 2, 0.5);
    // connectNodes(5, 7, uPoints, 15, "#888", 2, 0.5); connectNodes(7, 1, uPoints, 15, "#888", 2, 0.5);


    // ————— NODES —————
    function drawNode(x, y, r, fill, stroke, val, txtCol, fontSize = 25) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", r);
        c.setAttribute("fill", fill); c.setAttribute("stroke", stroke); c.setAttribute("stroke-width", "2");
        nodeLayer.appendChild(c);

        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", x); t.setAttribute("y", y);
        t.setAttribute("text-anchor", "middle"); t.setAttribute("dominant-baseline", "central");
        t.setAttribute("font-size", fontSize); t.setAttribute("font-weight", "bold");
        t.setAttribute("fill", txtCol);
        t.textContent = val;
        textLayer.appendChild(t);
    }

    // Outer Nodes
    const outerColors = ["#9A71C9", "#ffffff", "#9A71C9", "#ffffff", "#F34B47", "#ffffff", "#F34B47", "#ffffff"];
    const outerTxtColors = ["#fff", "#000", "#FFF", "#000", "#FFF", "#000", "#FFF", "#000"];
    for (let i = 0; i < 8; i++) {
        drawNode(outerPoints[i].x, outerPoints[i].y, 22, outerColors[i], "#000", values[i], outerTxtColors[i]);
    }

    // Center
    drawNode(cx, cy, 28, "#F4F866", "#000", centerValue, "#000", 18);
    // ZK
    const zkDotY = cy + 40;
    const zkC = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    zkC.setAttribute("cx", cx); zkC.setAttribute("cy", zkDotY); zkC.setAttribute("r", 10);
    zkC.setAttribute("fill", "#F4F866"); zkC.setAttribute("stroke", "#000"); zkC.setAttribute("stroke-width", "1");
    nodeLayer.appendChild(zkC);
    const zkT = document.createElementNS("http://www.w3.org/2000/svg", "text");
    zkT.setAttribute("x", cx); zkT.setAttribute("y", zkDotY);
    zkT.setAttribute("text-anchor", "middle"); zkT.setAttribute("dominant-baseline", "central");
    zkT.setAttribute("font-size", 10); zkT.setAttribute("font-weight", "bold"); zkT.textContent = "ЗК";
    textLayer.appendChild(zkT);


    // Inner Layers (Y and U)
    const innerRadius = 230;
    // Y Points (Between U and Outer)
    for (let i = 0; i < 8; i++) {
        const px = cx + innerRadius * Math.cos(angles[i]);
        const py = cy + innerRadius * Math.sin(angles[i]);
        let fill = "#fff", txt = "#000";
        if (i === 0 || i === 2) { fill = "#3366CC"; txt = "#fff"; } // Male/Spirit lines?
        // Wait, reference coloring:
        // Axis 0 (Left): Outer Purple, Inner Blue (Y), Innermost Blue (U).
        // Axis 2 (Top): Outer Purple, Inner Blue (Y), Innermost Blue (U).
        // Axis 4 (Right): Outer Red, Inner White (Y), Innermost Orange (U).
        // Axis 6 (Bottom): Outer Red, Inner White (Y), Innermost Orange (U).

        // Update styling based on observation
        if (i === 0) { fill = "#3366CC"; txt = "#fff"; }
        if (i === 2) { fill = "#3366CC"; txt = "#fff"; }
        // ... simplistic approach, stick to what we had or infer.
        // Let's use previous logic but cleaner.
        // i%2==0 is Main Axis. i%2!=0 is Diagonal.
        // Diagonals are usually white.
        if (i % 2 !== 0) { fill = "#fff"; txt = "#000"; }

        drawNode(px, py, 18, fill, "#000", Y[i], txt, 20);
    }

    // U Points (Inner)
    const uColors = ["#3EB4F0", "#fff", "#3EB4F0", "#fff", "#D88A4B", "#fff", "#D88A4B", "#fff"];
    const uTxtColors = ["#fff", "#000", "#fff", "#000", "#fff", "#000", "#fff", "#000"];
    for (let i = 0; i < 8; i++) {
        drawNode(uPoints[i].x, uPoints[i].y, 15, uColors[i], "#000", U[i], uTxtColors[i], 16);
        // Small markers near U5/U6
        if (i === 4) drawSmall(uPoints[i].x - 22, uPoints[i].y, "Л", "#D88A4B", "#fff");
        if (i === 6) drawSmall(uPoints[i].x, uPoints[i].y - 22, "М", "#D88A4B", "#fff");
    }

    function drawSmall(x, y, txt, fill, txtCol) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 6);
        c.setAttribute("fill", fill); c.setAttribute("stroke", "none");
        nodeLayer.appendChild(c);
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", x); t.setAttribute("y", y);
        t.setAttribute("text-anchor", "middle"); t.setAttribute("dominant-baseline", "central");
        t.setAttribute("font-size", 8); t.setAttribute("fill", txtCol); t.setAttribute("font-weight", "bold");
        t.textContent = txt;
        textLayer.appendChild(t);
    }

    // ARROWS (Male/Female lines)
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#333"/></marker>`;
    svg.appendChild(defs);

    function drawRay(idx, col, txt, isFlip) {
        // From Center to U-point (inner square corner)
        // Actually, lines go along diagonals.
        // Male: 1 (TL) to 5 (BR). Female: 3 (TR) to 7 (BL).
        // Draw line from Center to near Outer?
        // Reference shows line segment on the diagonal.
        const pFull = outerPoints[idx]; // Outer
        const pInner = uPoints[idx]; // Inner

        // Draw from Center to U?
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", cx); line.setAttribute("y1", cy);
        line.setAttribute("x2", pInner.x); line.setAttribute("y2", pInner.y); // To inner U
        line.setAttribute("stroke", col); line.setAttribute("stroke-width", 2);
        line.setAttribute("marker-end", "url(#arrowhead)");
        lineLayer.appendChild(line);

        // Text
        if (txt) {
            const mx = (cx + pInner.x) / 2, my = (cy + pInner.y) / 2;
            let deg = (angles[idx] * 180 / Math.PI);
            if (isFlip) deg += 180; // Text orientation
            // Tweaks for readability logic... simplified
            const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
            t.setAttribute("x", mx); t.setAttribute("y", my);
            t.setAttribute("text-anchor", "middle"); t.setAttribute("font-size", 9);
            t.setAttribute("transform", `rotate(${deg} ${mx} ${my}) translate(0, -5)`);
            t.textContent = txt;
            textLayer.appendChild(t);
        }
    }
    // Corrected text rotation based on user feedback
    drawRay(1, "#3E67EE", "линия мужского рода", true); // TL - Needs flip to be readable
    drawRay(5, "#3E67EE", "", false); // BR
    drawRay(3, "#F7494C", "линия женского рода", false); // TR - Needs NO flip to be readable (or opposite of before)
    drawRay(7, "#F7494C", "", true); // BL


    // DETAILED PERIMETER LINES (0-1, 1-2 etc)
    function drawPerimeter(i1, i2, v1, v2, config) {
        const p1 = outerPoints[i1], p2 = outerPoints[i2];

        // Calculate outward shift
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        let nx = -dy / len, ny = dx / len; // Normal

        // Ensure normal points outwards from center
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        const cxVecX = mx - cx, cxVecY = my - cy;
        if (nx * cxVecX + ny * cxVecY < 0) {
            nx = -nx; ny = -ny;
        }

        const offset = 18; // Shift lines outwards by 18px
        const sx = p1.x + nx * offset, sy = p1.y + ny * offset;
        const ex = p2.x + nx * offset, ey = p2.y + ny * offset;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", sx); line.setAttribute("y1", sy);
        line.setAttribute("x2", ex); line.setAttribute("y2", ey);
        line.setAttribute("stroke", "#000"); line.setAttribute("stroke-width", 2); line.setAttribute("opacity", 0.7);
        lineLayer.appendChild(line);

        // Calculate intermediate values
        const p4 = reduce(v1 + v2);
        const p2_ = reduce(p4 + v1);
        const p1_ = reduce(p2_ + v1);
        const p3 = reduce(p2_ + p4);
        const p6 = reduce(p4 + v2);
        const p5 = reduce(p4 + p6);
        const p7 = reduce(p6 + v2);
        const vals = [null, p1_, p2_, p3, p4, p5, p6, p7];

        for (let j = 1; j <= 7; j++) {
            const t = 0.5 + (j - 4) / 9; // Spacing logic
            const tx = sx + (ex - sx) * t;
            const ty = sy + (ey - sy) * t;

            // Dot
            const d = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            d.setAttribute("cx", tx); d.setAttribute("cy", ty); d.setAttribute("r", j === 4 ? 5 : 2.5);
            d.setAttribute("fill", "#cc3366"); d.setAttribute("stroke", "#fff");
            lineLayer.appendChild(d);

            // Label
            const l = document.createElementNS("http://www.w3.org/2000/svg", "text");
            const shiftX = config.shifts?.[j]?.x || -9;
            const shiftY = config.shifts?.[j]?.y || -1;
            l.setAttribute("x", tx + shiftX); l.setAttribute("y", ty + shiftY);
            l.setAttribute("text-anchor", "middle"); l.setAttribute("font-size", j === 4 ? 11 : 9);
            l.textContent = vals[j];
            textLayer.appendChild(l);

            // Years
            if (config.years?.[j]) {
                const yLb = document.createElementNS("http://www.w3.org/2000/svg", "text");
                const ysx = config.yearShifts?.[j]?.x || 5;
                const ysy = config.yearShifts?.[j]?.y || 8;
                yLb.setAttribute("x", tx + ysx); yLb.setAttribute("y", ty + ysy);
                yLb.setAttribute("font-size", j === 4 ? 8 : 7); yLb.setAttribute("fill", j === 4 ? "#000" : "#888");
                if (j === 4) yLb.setAttribute("font-weight", "bold");
                yLb.textContent = config.years[j];
                textLayer.appendChild(yLb);
            }
        }
    }

    // Configs (reused)
    drawPerimeter(0, 1, values[0], values[1], {
        shifts: { 1: { x: -9, y: -1 }, 2: { x: -9, y: -1 }, 3: { x: -9, y: -1 }, 4: { x: -12, y: -1 }, 5: { x: -9, y: -1 }, 6: { x: -9, y: -1 }, 7: { x: -9, y: -1 } },
        years: { 1: "1–2", 2: "2–3", 3: "3–4", 4: "5 лет", 5: "6–7", 6: "7–8", 7: "8–9" },
        yearShifts: { 1: { x: 5, y: 6 }, 2: { x: 5, y: 7 }, 3: { x: 5, y: 8 }, 4: { x: 5, y: 8 }, 5: { x: 5, y: 8 }, 6: { x: 5, y: 7 }, 7: { x: 5, y: 6 } }
    });
    drawPerimeter(1, 2, values[1], values[2], {
        shifts: { 1: { x: -9, y: -6 }, 2: { x: -9, y: -6 }, 3: { x: -9, y: -6 }, 4: { x: -9, y: -9 }, 5: { x: -9, y: -6 }, 6: { x: -9, y: -7 }, 7: { x: -9, y: -6 } },
        years: { 1: "11–12", 2: "12–13", 3: "13–14", 4: "15 лет", 5: "16–17", 6: "17–18", 7: "18–19" },
        yearShifts: { 1: { x: 1, y: 10 }, 2: { x: 1, y: 10 }, 3: { x: 1, y: 10 }, 4: { x: 1, y: 13 }, 5: { x: 1, y: 10 }, 6: { x: 1, y: 10 }, 7: { x: 1, y: 10 } }
    });
    drawPerimeter(2, 3, values[2], values[3], {
        shifts: { 1: { x: 8, y: -7 }, 2: { x: 8, y: -7 }, 3: { x: 8, y: -7 }, 4: { x: 12, y: -7 }, 5: { x: 8, y: -7 }, 6: { x: 8, y: -7 }, 7: { x: 5, y: -7 } },
        years: { 1: "21–22", 2: "22–23", 3: "23–24", 4: "25 лет", 5: "26–27", 6: "27–28", 7: "28–29" },
        yearShifts: { 1: { x: -17, y: 10 }, 2: { x: -17, y: 10 }, 3: { x: -17, y: 10 }, 4: { x: -20, y: 12 }, 5: { x: -17, y: 10 }, 6: { x: -17, y: 10 }, 7: { x: -17, y: 10 } }
    });
    drawPerimeter(3, 4, values[3], values[4], {
        shifts: { 1: { x: 9, y: 3 }, 2: { x: 9, y: 1 }, 3: { x: 9, y: 1 }, 4: { x: 12, y: 1 }, 5: { x: 9, y: 1 }, 6: { x: 9, y: 1 }, 7: { x: 9, y: -3 } },
        years: { 1: "31–32", 2: "32–33", 3: "33–34", 4: "35 лет", 5: "36–37", 6: "37–38", 7: "38–39" },
        yearShifts: { 1: { x: -24, y: 5 }, 2: { x: -24, y: 5 }, 3: { x: -24, y: 5 }, 4: { x: -32, y: 5 }, 5: { x: -24, y: 5 }, 6: { x: -24, y: 5 }, 7: { x: -24, y: 5 } }
    });
    drawPerimeter(4, 5, values[4], values[5], {
        shifts: { 1: { x: 9, y: 15 }, 2: { x: 9, y: 15 }, 3: { x: 9, y: 15 }, 4: { x: 12, y: 15 }, 5: { x: 9, y: 15 }, 6: { x: 9, y: 15 }, 7: { x: 9, y: 5 } },
        years: { 1: "41–42", 2: "42–43", 3: "43–44", 4: "45 лет", 5: "46–47", 6: "47–48", 7: "48–49" },
        yearShifts: { 1: { x: -25, y: 2 }, 2: { x: -25, y: 2 }, 3: { x: -25, y: 2 }, 4: { x: -33, y: 2 }, 5: { x: -25, y: 2 }, 6: { x: -25, y: 2 }, 7: { x: -25, y: 2 } }
    });
    drawPerimeter(5, 6, values[5], values[6], {
        shifts: { 1: { x: 9, y: 15 }, 2: { x: 9, y: 15 }, 3: { x: 9, y: 15 }, 4: { x: 12, y: 15 }, 5: { x: 9, y: 15 }, 6: { x: 9, y: 15 }, 7: { x: 9, y: 15 } },
        years: { 1: "51–52", 2: "52–53", 3: "53–54", 4: "55 лет", 5: "56–57", 6: "57–58", 7: "58–59" },
        yearShifts: { 1: { x: -15, y: -5 }, 2: { x: -15, y: -5 }, 3: { x: -15, y: -5 }, 4: { x: -20, y: -8 }, 5: { x: -15, y: -5 }, 6: { x: -15, y: -5 }, 7: { x: -15, y: -5 } }
    });
    drawPerimeter(6, 7, values[6], values[7], {
        shifts: { 1: { x: -9, y: 15 }, 2: { x: -9, y: 15 }, 3: { x: -9, y: 15 }, 4: { x: -12, y: 15 }, 5: { x: -9, y: 15 }, 6: { x: -9, y: 15 }, 7: { x: -9, y: 15 } },
        years: { 1: "61–62", 2: "62–63", 3: "63–64", 4: "65 лет", 5: "66–67", 6: "67–68", 7: "68–69" },
        yearShifts: { 1: { x: -2, y: -5 }, 2: { x: -2, y: -5 }, 3: { x: -2, y: -5 }, 4: { x: -2, y: -8 }, 5: { x: -2, y: -5 }, 6: { x: -2, y: -5 }, 7: { x: -2, y: -5 } }
    });
    drawPerimeter(7, 0, values[7], values[0], {
        shifts: { 1: { x: -9, y: 5 }, 2: { x: -9, y: 10 }, 3: { x: -9, y: 10 }, 4: { x: -12, y: 10 }, 5: { x: -9, y: 10 }, 6: { x: -9, y: 10 }, 7: { x: -9, y: 10 } },
        years: { 1: "71–72", 2: "72–73", 3: "73–74", 4: "75 лет", 5: "76–77", 6: "77–78", 7: "78–79" },
        yearShifts: { 1: { x: 5, y: 2 }, 2: { x: 5, y: 2 }, 3: { x: 5, y: 2 }, 4: { x: 5, y: 2 }, 5: { x: 5, y: 2 }, 6: { x: 5, y: 2 }, 7: { x: 5, y: 2 } }
    });


    // Extra Special Nodes (Bottom/Center)
    const innerA = reduce(U[4] + U[6]);
    const innerB = reduce(U[4] + innerA);
    const innerC = reduce(U[6] + innerA);


    function drawExtra(angleIdx, offX, offY, val, letter, lOffX, lOffY, col, dol, hrt) {
        const ang = angles[angleIdx];
        const rad = innerRadius2 * 0.5;
        const x = cx + rad * Math.cos(ang) + offX;
        const y = cy + rad * Math.sin(ang) + offY;

        drawNode(x, y, 12, col, "#000", val, "#000", 14);
        // Letter
        const lc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        lc.setAttribute("cx", x + lOffX); lc.setAttribute("cy", y + lOffY); lc.setAttribute("r", 7);
        lc.setAttribute("fill", "#000");
        const lt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        lt.setAttribute("x", x + lOffX); lt.setAttribute("y", y + lOffY);
        lt.setAttribute("text-anchor", "middle"); lt.setAttribute("dominant-baseline", "central");
        lt.setAttribute("fill", "#fff"); lt.setAttribute("font-size", 9); lt.setAttribute("font-weight", "bold");
        lt.textContent = letter;
        nodeLayer.appendChild(lc); textLayer.appendChild(lt);

        if (dol) {
            const d = document.createElementNS("http://www.w3.org/2000/svg", "text");
            d.setAttribute("x", x - 15); d.setAttribute("y", y - 37);
            d.setAttribute("font-size", 26); d.setAttribute("fill", "#04dd00"); d.setAttribute("font-weight", "bold");
            d.textContent = "$";
            textLayer.appendChild(d);
        }
        if (hrt) {
            const hx = x - 35, hy = y - 35;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M ${hx} ${hy} c -5 -5, -15 0, -10 10 c 5 10, 15 10, 20 0 c 5 -10, -5 -15, -10 -10 Z`);
            path.setAttribute("fill", "#e84e42"); path.setAttribute("stroke", "#000");
            nodeLayer.appendChild(path);
        }
    }
    drawExtra(5, 10, 10, innerA, "К", -13, -13, "#fff", false, false);
    drawExtra(5, 80, 10, innerB, "О", -13, -13, "#fff", true, false);
    drawExtra(5, 10, 80, innerC, "Н", -13, -13, "#fff", false, true);

    // Mids
    function drawMidExtra(idx, val) {
        const rad = innerRadius2 / 2;
        const x = cx + rad * Math.cos(angles[idx]);
        const y = cy + rad * Math.sin(angles[idx]);
        drawNode(x, y, 15, "#73b55f", "#000", val, "#fff", 14);
    }
    drawMidExtra(0, midU1);
    drawMidExtra(2, midU2);

    // Outer Age Markers
    function drawOuterMarker(i, letter, txt, ox, oy, tAlign, tOx, tOy) {
        const p = outerPoints[i];
        const x = p.x + ox, y = p.y + oy;

        // Marker Circle
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 12); // Slightly larger
        c.setAttribute("fill", (["В", "Г"].includes(letter) ? "#e84e42" : (i % 2 !== 0 ? "#000" : "#a185c8")));
        nodeLayer.appendChild(c);

        // Letter inside marker
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", x); t.setAttribute("y", y);
        t.setAttribute("text-anchor", "middle"); t.setAttribute("dominant-baseline", "central");
        t.setAttribute("fill", "#fff"); t.setAttribute("font-weight", "bold"); t.setAttribute("font-size", 14);
        t.textContent = letter;
        textLayer.appendChild(t);

        // Age Label (outside)
        const sub = document.createElementNS("http://www.w3.org/2000/svg", "text");
        sub.setAttribute("x", x + tOx); sub.setAttribute("y", y + tOy);
        sub.setAttribute("text-anchor", tAlign); // start, end, middle
        sub.setAttribute("dominant-baseline", "central");
        sub.setAttribute("font-size", 13); sub.setAttribute("font-weight", "bold"); sub.setAttribute("fill", "#000");
        sub.textContent = txt;
        textLayer.appendChild(sub);
    }

    // Refined positions based on reference
    // 0: Left (A) - Text to Left
    drawOuterMarker(0, "A", "0 лет", -35, 0, "end", -18, 0);

    // 1: TL (Д) - Text to Left
    drawOuterMarker(1, "Д", "10 лет", -25, -25, "end", -15, 0);

    // 2: Top (Б) - Text to Right
    drawOuterMarker(2, "Б", "20 лет", 0, -35, "start", 15, 0);

    // 3: TR (Е) - Text to Right
    drawOuterMarker(3, "Е", "30 лет", 25, -25, "start", 15, 0);

    // 4: Right (В) - Text to Right
    drawOuterMarker(4, "В", "40 лет", 35, 0, "start", 18, 0);

    // 5: BR (Ж) - Text to Right
    drawOuterMarker(5, "Ж", "50 лет", 25, 25, "start", 15, 0);

    // 6: Bottom (Г) - Text to Right
    drawOuterMarker(6, "Г", "60 лет", 0, 35, "start", 15, 0);

    // 7: BL (З) - Text to Left
    drawOuterMarker(7, "З", "70 лет", -25, 25, "end", -15, 0);
}
