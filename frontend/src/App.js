import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
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
    return (_jsxs("main", { className: "app-shell", children: [_jsxs("header", { className: "hero", children: [_jsx("h1", { children: "\uB0B4 \uC8FC\uBCC0 \uBCD1\uC6D0 \uCC3E\uAE30" }), _jsx("p", { children: "\uC99D\uC0C1\uC744 \uC785\uB825\uD558\uACE0 \uAC00\uAE4C\uC6B4 \uBCD1\uC6D0\uC744 \uBE60\uB974\uAC8C \uCC3E\uC544\uBCF4\uC138\uC694." })] }), _jsxs("section", { className: "card", children: [_jsxs("form", { className: "form", onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "region", children: "\uC9C0\uC5ED (\uC120\uD0DD)" }), _jsx("input", { id: "region", type: "text", placeholder: "\uC608: \uC11C\uC6B8 \uAC15\uB0A8\uAD6C", value: region, onChange: (event) => setRegion(event.target.value) }), _jsx("small", { children: "\uC9C0\uC5ED\uC744 \uC9C0\uC815\uD558\uBA74 \uD574\uB2F9 \uC9C0\uC5ED + \uC9C4\uB8CC\uACFC\uB85C \uB124\uC774\uBC84 \uC9C0\uB3C4 \uAC80\uC0C9\uC744 \uC5F4\uC5B4\uC90D\uB2C8\uB2E4." })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "symptom", children: "\uC99D\uC0C1" }), _jsx("textarea", { id: "symptom", rows: 4, placeholder: "\uC608: \uC5B4\uC81C\uBD80\uD130 \uACC4\uC18D\uB418\uB294 \uC2EC\uD55C \uBCF5\uD1B5\uACFC \uC124\uC0AC", value: symptom, onChange: (event) => setSymptom(event.target.value), required: true })] }), _jsxs("div", { className: "actions", children: [_jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? "검색 중..." : "병원 검색" }), _jsx("button", { type: "button", className: "secondary", onClick: handleClear, disabled: isLoading, children: "\uCD08\uAE30\uD654" })] })] }), error && _jsx("div", { className: "alert error", children: error }), response && (_jsxs("div", { className: "results", children: [_jsxs("section", { children: [_jsx("h2", { children: "\uCD94\uCC9C \uC9C4\uB8CC\uACFC" }), _jsx("ul", { children: response.departments.map((department) => (_jsx("li", { children: department }, department))) })] }), _jsxs("section", { children: [_jsx("h2", { children: "\uB124\uC774\uBC84 \uC9C0\uB3C4\uC5D0\uC11C \uBCF4\uAE30" }), _jsx("ul", { className: "hospital-list", children: response.searches.map((search) => (_jsxs("li", { children: [_jsxs("div", { className: "hospital-header", children: [_jsx("h3", { children: search.department }), _jsxs("div", { className: "map-links", children: [_jsx("a", { href: search.webUrl, target: "_blank", rel: "noreferrer", children: "\uC6F9\uC73C\uB85C \uC5F4\uAE30" }), _jsx("a", { href: search.appUrl, children: "\uC571\uC73C\uB85C \uC5F4\uAE30" })] })] }), _jsx("button", { type: "button", className: "open-button", onClick: () => handleOpen(search.webUrl), children: "\uB124\uC774\uBC84\uC9C0\uB3C4 \uAC80\uC0C9" })] }, search.department))) })] })] }))] })] }));
}
