import { NextResponse } from "next/server";
import { jwtVerify } from "jose";


export async function middleware(request) {
    // Get cookie from request.
    const cookie = request.cookies.get('authToken'); // TODO: put this into string constants file.
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Perform token verification if cookie exists
    let isAuthenticated = false;
    let phone = null;
    if (cookie) {
        const providedToken = cookie.value;
        const secret = process.env.JWT_SECRET || "";

        try {
            const verification = await jwtVerify(providedToken, new TextEncoder().encode(secret));
            if (verification) phone = verification.payload.phone;
            isAuthenticated = true;
        } catch (error) {
            console.log("Token verification failed");
            console.log(error);
            isAuthenticated = false;
        }
    }

    // Define redirection logic based on route and authentication status
    const routes = {
        '/': isAuthenticated ? '/home' : '/login',
        '/home': isAuthenticated ? null : '/login',
        '/login': isAuthenticated ? '/home' : null,
    };

    let response;
    // Handle current route case
    if (routes[pathname]) {
        response = NextResponse.redirect(new URL(routes[pathname], request.url));
    } else {
        // If no redirect needed, allow the request to continue
        response = NextResponse.next();
    }

    if (!isAuthenticated) {
        response.cookies.delete('authToken');
    } else {
        response.headers.set('phone', phone);
    }

    return response;
}

export const config = {
    matcher: ['/', '/home', '/login']
}