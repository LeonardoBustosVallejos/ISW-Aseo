import '@styles/error404.css';

const Error404 = ({ error = null, status = null }) => {
  return (
    <main className="error_404">
      <div className="card">
        <h1>
          {status ? status === 'Client error' ?
            error?.message ? 400 : 404
            :
            500 : 404
          }</h1>
        <h3>~ {error?.dataInfo ? error.dataInfo : 'Página no encontrada'} ~</h3>
        <h4>{error?.message || error || 'Lo sentimos, la página que estás buscando no existe :('}</h4>
      </div>
    </main>
  );
};

export default Error404;