// KARAGEN - Utility Functions
// Parsers for JSON and SRT lyrics files

function parseContent(text, isJson) {
    if (isJson) {
        try {
            const json = JSON.parse(text);
            return (json.segments || json).flatMap(s =>
                (s.words || []).map(w => ({
                    text: w.text,
                    start: w.start_time || w.start,
                    end: w.end_time || w.end
                }))
            );
        } catch (e) {
            return parseSRT(text);
        }
    }
    return parseSRT(text);
}

function parseSRT(data) {
    return data
        .replace(/\r/g, "")
        .split("\n\n")
        .map(block => {
            const lines = block.split("\n");
            if (lines.length >= 3) {
                const match = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
                if (match) {
                    const toSeconds = t => {
                        const [h, m, s] = t.replace(",", ".").split(":");
                        return (+h * 3600) + (+m * 60) + (+s);
                    };
                    const start = toSeconds(match[1]);
                    const end = toSeconds(match[2]);
                    const txt = lines.slice(2).join(" ").trim();
                    const words = txt.split(" ");
                    const dur = (end - start) / words.length;
                    return words.map((t, i) => ({
                        text: t,
                        start: start + i * dur,
                        end: start + (i + 1) * dur
                    }));
                }
            }
            return [];
        })
        .flat();
}

// Export
if (typeof window !== 'undefined') {
    window.KaraUtils = { parseContent, parseSRT };
}
