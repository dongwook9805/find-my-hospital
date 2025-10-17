import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import "./App.css";
export default function App() {
    const [symptom, setSymptom] = useState("");
    const [region, setRegion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [response, setResponse] = useState(null);
    const handleOpen = (webUrl) => {
        window.open(webUrl, "_blank", "noopener,noreferrer");
    };
    const departmentPalette = useMemo(() => [
        "내과",
        "외과",
        "신경외과",
        "정형외과",
        "성형외과",
        "산부인과",
        "피부과",
        "안과",
        "비뇨의학과",
        "이비인후과",
        "정신건강의학과",
        "소아청소년과",
        "재활의학과",
        "치과",
    ], []);
    const sampleRegions = useMemo(() => ["서울 강남구", "부산 해운대구", "대구 수성구", "광주 동구"], []);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setResponse(null);
        if (!symptom.trim()) {
            setError("증상을 입력해주세요.");
            return;
        }
        const edgeUrl = import.meta.env.VITE_EDGE_URL;
        if (!edgeUrl) {
            setError("Edge Function URL(VITE_EDGE_URL)이 설정되지 않았습니다.");
            return;
        }
        setIsLoading(true);
        try {
            const payload = {
                symptom: symptom.trim(),
                region: region.trim() || undefined,
            };
            const res = await fetch(edgeUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const message = await res.text();
                throw new Error(message || "검색에 실패했습니다.");
            }
            const data = (await res.json());
            setResponse(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleClear = () => {
        setSymptom("");
        setRegion("");
        setResponse(null);
        setError(null);
    };
    return (_jsxs("div", { className: "app-frame", children: [_jsx("div", { className: "ambient", "aria-hidden": "true" }), _jsxs("main", { className: "app-shell", children: [_jsxs("header", { className: "hero", children: [_jsx("span", { className: "badge", children: "Find My Hospital" }), _jsxs("h1", { children: ["\uC99D\uC0C1 \uC785\uB825 \uD55C \uBC88\uC73C\uB85C ", _jsx("span", { children: "\uB531 \uB9DE\uB294 \uC9C4\uB8CC\uACFC" }), "\uB97C \uCD94\uCC9C\uBC1B\uACE0,", _jsx("span", { children: " \uB124\uC774\uBC84 \uC9C0\uB3C4\uB85C \uBC14\uB85C \uC774\uB3D9" }), "\uD558\uC138\uC694."] }), _jsx("p", { children: "GPT\uAC00 \uCD94\uCC9C\uD558\uB294 \uC9C4\uB8CC\uACFC \uC911\uC5D0\uC11C \uC6D0\uD558\uB294 \uC9C0\uC5ED\uC744 \uBE60\uB974\uAC8C \uAC80\uC0C9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uB525\uB9C1\uD06C\uB85C \uB124\uC774\uBC84 \uC9C0\uB3C4 \uC571\uB3C4 \uC989\uC2DC \uC2E4\uD589\uB3FC\uC694." })] }), _jsxs("section", { className: "content-grid", children: [_jsxs("div", { className: "card form-card", children: [_jsxs("form", { className: "form", onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "region", children: "\uC9C0\uC5ED (\uC120\uD0DD)" }), _jsx("input", { id: "region", type: "text", placeholder: "\uC608: \uC11C\uC6B8 \uAC15\uB0A8\uAD6C", value: region, onChange: (event) => setRegion(event.target.value) }), _jsx("small", { children: "\uC9C0\uC5ED\uC744 \uD568\uAED8 \uC785\uB825\uD558\uBA74 \"\uC9C0\uC5ED + \uC9C4\uB8CC\uACFC\"\uB85C \uB124\uC774\uBC84 \uC9C0\uB3C4 \uAC80\uC0C9\uC744 \uC2E4\uD589\uD569\uB2C8\uB2E4." }), _jsx("div", { className: "quick-pills", children: sampleRegions.map((item) => (_jsx("button", { type: "button", onClick: () => setRegion(item), children: item }, item))) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "symptom", children: "\uC99D\uC0C1" }), _jsx("textarea", { id: "symptom", rows: 5, placeholder: "\uC608: \uC5B4\uC81C\uBD80\uD130 \uBCF5\uD1B5\uACFC \uBA54\uC2A4\uAEBC\uC6C0\uC774 \uC2EC\uD558\uACE0 \uC5F4\uC774 \uB0A9\uB2C8\uB2E4.", value: symptom, onChange: (event) => setSymptom(event.target.value), required: true })] }), _jsxs("div", { className: "actions", children: [_jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? "추천 중..." : "진료과 추천받기" }), _jsx("button", { type: "button", className: "secondary", onClick: handleClear, disabled: isLoading, children: "\uCD08\uAE30\uD654" })] })] }), error && _jsx("div", { className: "alert error", children: error }), response && (_jsxs("div", { className: "results-panel", children: [_jsxs("div", { className: "recommended", children: [_jsx("h2", { children: "\uCD94\uCC9C \uC9C4\uB8CC\uACFC" }), _jsx("div", { className: "chip-row", children: response.departments.map((department) => (_jsx("span", { className: "chip accent", children: department }, department))) })] }), _jsx("div", { className: "naver-list", children: response.searches.map((search) => (_jsxs("article", { className: "naver-card", children: [_jsxs("div", { className: "naver-card__header", children: [_jsx("h3", { children: region ? `${region} ${search.department}` : search.department }), _jsx("span", { className: "hint", children: "\uB124\uC774\uBC84 \uC9C0\uB3C4 \uAC80\uC0C9 \uBC14\uB85C\uAC00\uAE30" })] }), _jsxs("div", { className: "naver-card__actions", children: [_jsx("a", { href: search.webUrl, target: "_blank", rel: "noreferrer", className: "ghost", children: "\uC6F9 \uC5F4\uAE30" }), _jsx("a", { href: search.appUrl, className: "ghost", children: "\uC571 \uC5F4\uAE30" }), _jsx("button", { type: "button", onClick: () => handleOpen(search.webUrl), children: "\uC0C8 \uD0ED\uC5D0\uC11C \uAC80\uC0C9" })] })] }, search.department))) })] }))] }), _jsxs("aside", { className: "card guide-card", children: [_jsx("h2", { children: "\uC774\uB807\uAC8C \uD65C\uC6A9\uD574\uBCF4\uC138\uC694" }), _jsxs("ol", { children: [_jsx("li", { children: "\uC99D\uC0C1\uC744 \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uC785\uB825\uD558\uBA74 GPT\uAC00 \uAC00\uC7A5 \uC801\uD569\uD55C \uC9C4\uB8CC\uACFC\uB97C \uACE8\uB77C\uC90D\uB2C8\uB2E4." }), _jsx("li", { children: "\uC9C0\uC5ED\uC744 \uB123\uC73C\uBA74 \"\uC9C0\uC5ED + \uC9C4\uB8CC\uACFC\"\uB85C \uBE60\uB978 \uB124\uC774\uBC84 \uC9C0\uB3C4 \uAC80\uC0C9\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4." }), _jsx("li", { children: "\uC571 \uB9C1\uD06C\uB97C \uB204\uB974\uBA74 \uB124\uC774\uBC84 \uC9C0\uB3C4 \uC571\uC774 \uBC14\uB85C \uC5F4\uB824 \uAE38 \uC548\uB0B4\uAE4C\uC9C0 \uC5F0\uACB0\uB3FC\uC694." })] }), _jsx("h3", { children: "\uC9C0\uC6D0 \uC9C4\uB8CC\uACFC" }), _jsx("div", { className: "chip-grid", children: departmentPalette.map((department) => (_jsx("span", { className: "chip", children: department }, department))) })] })] })] })] }));
}
