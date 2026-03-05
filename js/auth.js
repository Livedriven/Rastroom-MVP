export function getSessionUser() {
  const raw = sessionStorage.getItem("session_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem("session_user");
    return null;
  }
}

export function requireAuth(allowedRoles = []) {
  const user = getSessionUser();

  if (!user) {
    window.location.assign("../index.html"); // ajuste se sua home/login tiver outro caminho
    return null;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // se estiver logado mas sem permissão, manda pro destino correto dele
    const roleHome = {
      admin: "./gestor.html",
      producao: "./producao.html",
      montagem: "./montagem.html",
      cadastro: "./cadastro.html",
    };

    window.location.assign(roleHome[user.role] ?? "../index.html");
    return null;
  }

  return user;
}

export function logout() {
  sessionStorage.removeItem("session_user");
  window.location.assign("../index.html");
}