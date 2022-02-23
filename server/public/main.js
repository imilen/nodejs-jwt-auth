const response = document.getElementById('response');

async function login(data) {

    let res = await fetch('api/user/login', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json'
        }
    });

    res = await res.json();
    response.innerHTML = JSON.stringify(res, '\n', 2);

    const { accessToken } = res;
    localStorage.setItem('accessToken', accessToken);

}
async function register(data) {

    let res = await fetch('api/user/register', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json'
        },
    });

    res = await res.json();
    response.innerHTML = JSON.stringify(res, '\n', 2);
}

async function logout() {

    const accessToken = localStorage.getItem('accessToken');
    let headers = { 'content-type': 'application/json' };

    headers = {
        ...headers,
        ...!!accessToken ? { 'authorization': 'Bearer ' + accessToken } : null
    }

    let res = await fetch('api/user/logout', {
        method: 'post',
        headers,
    });

    res = await res.json();
    response.innerHTML = JSON.stringify(res, '\n', 2);

    localStorage.removeItem('accessToken');
}

async function admin() {

    let res = await fetch('api/admin', {
        method: 'get',
        headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + localStorage.getItem('accessToken')
        },
    });

    res = await res.json();
    response.innerHTML = JSON.stringify(res, '\n', 2);

}

async function newToken() {

    let res = await fetch('api/user/new/token', {
        method: 'post',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            // "refreshToken": localStorage.getItem('refreshToken')
        }),
    });

    res = await res.json();
    response.innerHTML = JSON.stringify(res, '\n', 2);

    const { accessToken } = res;
    localStorage.setItem('accessToken', accessToken);

}