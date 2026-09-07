import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="status-panel" aria-labelledby="app-title">
        <div className="brand-mark" aria-hidden="true">
          NS
        </div>
        <div>
          <p className="eyebrow">Production preview</p>
          <h1 id="app-title">Notes Sync</h1>
          <p className="lede">
            A clean build is ready for deployment. External starter links and
            third-party snippets are not included.
          </p>
        </div>
        <dl className="status-grid" aria-label="Deployment status">
          <div>
            <dt>Runtime</dt>
            <dd>Static Vite app</dd>
          </div>
          <div>
            <dt>Third-party</dt>
            <dd>Disabled</dd>
          </div>
          <div>
            <dt>Firewall Risk</dt>
            <dd>Reduced</dd>
          </div>
        </dl>
      </section>
    </main>
  )
}

export default App
