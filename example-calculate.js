
function calculateProcessCapability(spec, tolPlus, tolMinus, data) {
    // คำนวณ USL และ LSL
    const USL = spec + tolPlus;
    const LSL = spec - tolMinus;

    // คำนวณ Range
    const range = Math.max(...data) - Math.min(...data);

    // ค่าเฉลี่ย
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;

    // ส่วนเบี่ยงเบนมาตรฐาน (sample)
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
    const s = Math.sqrt(variance);

    // Cp
    const Cp = (USL - LSL) / (6 * s);

    // Cpu และ Cpl
    const Cpu = (USL - mean) / (3 * s);
    const Cpl = (mean - LSL) / (3 * s);

    // Cpk
    const Cpk = Math.min(Cpu, Cpl);

    return {
        USL,
        LSL,
        range,
        mean,
        s,
        Cp,
        Cpu,
        Cpl,
        Cpk
    };
}

// ตัวอย่างการใช้งาน
const spec = 50;
const tolPlus = 5;
const tolMinus = 5;
const data = [48, 52, 50, 49, 53];

const result = calculateProcessCapability(spec, tolPlus, tolMinus, data);
console.log(result);