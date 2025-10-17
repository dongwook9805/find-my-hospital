import { useState } from "react";
import "./App.css";

type SearchResponse = {
  departments: string[];
  searches: Array<{
    department: string;
    webUrl: string;
    appUrl: string;
  }>;
};

export default function App() {
  const [symptom, setSymptom] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SearchResponse | null>(null);

  const handleOpen = (webUrl: string) => {
    window.open(webUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

      const data = (await res.json()) as SearchResponse;
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSymptom("");
    setResponse(null);
    setError(null);
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>내 주변 병원 찾기</h1>
        <p>증상을 입력하고 가까운 병원을 빠르게 찾아보세요.</p>
      </header>

      <section className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="symptom">증상</label>
            <textarea
              id="symptom"
              rows={4}
              placeholder="예: 어제부터 계속되는 심한 복통과 설사"
              value={symptom}
              onChange={(event) => setSymptom(event.target.value)}
              required
            />
          </div>

          <div className="actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? "검색 중..." : "병원 검색"}
            </button>
            <button type="button" className="secondary" onClick={handleClear} disabled={isLoading}>
              초기화
            </button>
          </div>
        </form>

        {error && <div className="alert error">{error}</div>}

        {response && (
          <div className="results">
            <section>
              <h2>추천 진료과</h2>
              <ul>
                {response.departments.map((department) => (
                  <li key={department}>{department}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>네이버 지도에서 보기</h2>
              <ul className="hospital-list">
                {response.searches.map((search) => (
                  <li key={search.department}>
                    <div className="hospital-header">
                      <h3>{search.department}</h3>
                      <div className="map-links">
                        <a href={search.webUrl} target="_blank" rel="noreferrer">
                          웹으로 열기
                        </a>
                        <a href={search.appUrl}>앱으로 열기</a>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="open-button"
                      onClick={() => handleOpen(search.webUrl)}
                    >
                      네이버지도 검색
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
