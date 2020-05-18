const apiRoutes = require("../index")


describe('routes', () => {

    test("check api routes", () => {
        const controlRoutes = [
            {
                path : "/qr",
                method : "post"
            },
            {
                path : "/qr/:code",
                method : "put"
            },
            {
                path : "/queue",
                method : "post"
            },
            {
                path : "/queue/:code",
                method : "get"
            },
            {
                path : "/queue/stats/time",
                method : "get"
            },
            {
                path : "/queue/stats/time",
                method : "post"
            },
            {
                path : "/queue/stats/length",
                method : "get"
            },
            {
                path : "/queue/stats/length/:code",
                method : "get"
            }
        ]
        controlRoutes.forEach(route => {
            const match = apiRoutes.stack.find(
                (s) => s.route.path === route.path && s.route.methods[route.method],
            );
            expect(match).toBeTruthy();
        })
    })
})
