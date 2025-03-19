class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode; // Stores the HTTP status code (e.g., 200 for success, 404 for not found)
        this.data = data; // Stores the response data (e.g., user details, API result)
        this.message = message; // Stores the response message (default: "Success")
        this.success = statusCode < 400; // Determines if the request was successful (true if status code is below 400)
    }
}

export { ApiResponse }; // Exports the class for use in other files
