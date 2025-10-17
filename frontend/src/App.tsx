import { useMemo, useState } from "react";
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
const [region, setRegion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SearchResponse | null>(null);

  const handleOpen = (webUrl: string) => {
    window.open(webUrl, "_blank", "noopener,noreferrer");
  };

  const departmentPalette = useMemo(
    () => [
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
    ],
    [],
  );

  const sampleRegions = useMemo(
    () => ["서울 강남구", "부산 해운대구", "대구 수성구", "광주 동구"],
    [],
  );

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
    setRegion("");
    setResponse(null);
    setError(null);
  };

  return (
    <div className="app-frame">
      <div className="ambient" aria-hidden="true" />
      <main className="app-shell">
        <header className="hero">
          <span className="badge">Find My Hospital</span>
          <h1>
            증상 입력 한 번으로 <span>딱 맞는 진료과</span>를 추천받고,
            <span> 네이버 지도로 바로 이동</span>하세요.
          </h1>
          <p>
            GPT가 추천하는 진료과 중에서 원하는 지역을 빠르게 검색할 수 있습니다.
            딥링크로 네이버 지도 앱도 즉시 실행돼요.
          </p>
        </header>

        <section className="content-grid">
          <div className="card form-card">
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="region">지역 (선택)</label>
                <input
                  id="region"
                  type="text"
                  placeholder="예: 서울 강남구"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                />
                <small>지역을 함께 입력하면 "지역 + 진료과"로 네이버 지도 검색을 실행합니다.</small>
                <div className="quick-pills">
                  {sampleRegions.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setRegion(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="symptom">증상</label>
                <textarea
                  id="symptom"
                  rows={5}
                  placeholder="예: 어제부터 복통과 메스꺼움이 심하고 열이 납니다."
                  value={symptom}
                  onChange={(event) => setSymptom(event.target.value)}
                  required
                />
              </div>

              <div className="actions">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "추천 중..." : "진료과 추천받기"}
                </button>
                <button type="button" className="secondary" onClick={handleClear} disabled={isLoading}>
                  초기화
                </button>
              </div>
            </form>

            {error && <div className="alert error">{error}</div>}

            {response && (
              <div className="results-panel">
                <div className="recommended">
                  <h2>추천 진료과</h2>
                  <div className="chip-row">
                    {response.departments.map((department) => (
                      <span key={department} className="chip accent">
                        {department}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="naver-list">
                  {response.searches.map((search) => (
                    <article key={search.department} className="naver-card">
                      <div className="naver-card__header">
                        <h3>{region ? `${region} ${search.department}` : search.department}</h3>
                        <span className="hint">네이버 지도 검색 바로가기</span>
                      </div>
                      <div className="naver-card__actions">
                        <a href={search.webUrl} target="_blank" rel="noreferrer" className="ghost">
                          웹 열기
                        </a>
                        <a href={search.appUrl} className="ghost">
                          앱 열기
                        </a>
                        <button type="button" onClick={() => handleOpen(search.webUrl)}>
                          새 탭에서 검색
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="card guide-card">
            <h2>이렇게 활용해보세요</h2>
            <ol>
              <li>증상을 자연스럽게 입력하면 GPT가 가장 적합한 진료과를 골라줍니다.</li>
              <li>지역을 넣으면 "지역 + 진료과"로 빠른 네이버 지도 검색이 가능합니다.</li>
              <li>앱 링크를 누르면 네이버 지도 앱이 바로 열려 길 안내까지 연결돼요.</li>
            </ol>

            <h3>지원 진료과</h3>
            <div className="chip-grid">
              {departmentPalette.map((department) => (
                <span key={department} className="chip">
                  {department}
                </span>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
