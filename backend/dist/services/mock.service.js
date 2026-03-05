"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockService = exports.MockService = void 0;
class MockService {
    mockPool = [
        {
            question: "What is the primary purpose of React's virtual DOM?",
            options: [
                "To optimize performance by minimizing direct manipulation of the actual DOM",
                "To provide a direct replacement for the browser's native DOM",
                "To allow developers to bypass JavaScript completely",
                "To enable servers to render HTML faster"
            ],
            correctAnswer: "To optimize performance by minimizing direct manipulation of the actual DOM",
            explanation: "The virtual DOM is a lightweight copy of the actual DOM. React uses it to calculate the most efficient way to update the browser's UI.",
            difficulty: "MEDIUM",
            topic: "React Core"
        },
        {
            question: "Which of the following is NOT a fundamental concept of Object-Oriented Programming?",
            options: [
                "Encapsulation",
                "Asymptotic Analysis",
                "Polymorphism",
                "Inheritance"
            ],
            correctAnswer: "Asymptotic Analysis",
            explanation: "Encapsulation, Polymorphism, and Inheritance are the pillars of OOP. Asymptotic Analysis (Big O) is a concept in algorithm analysis.",
            difficulty: "MEDIUM",
            topic: "Software Engineering"
        },
        {
            question: "In the context of REST APIs, what does the HTTP 404 status code indicate?",
            options: [
                "Internal Server Error",
                "Unauthorized Access",
                "The requested resource could not be found",
                "Method Not Allowed"
            ],
            correctAnswer: "The requested resource could not be found",
            explanation: "A 404 error means the server could reach the website, but the specific page or resource requested does not exist.",
            difficulty: "EASY",
            topic: "Web Development"
        },
        {
            question: "What is the Big O time complexity of searching for an element in a balanced binary search tree (BST)?",
            options: [
                "O(1)",
                "O(n)",
                "O(log n)",
                "O(n log n)"
            ],
            correctAnswer: "O(log n)",
            explanation: "In a balanced BST, each comparison allows you to skip half of the remaining tree, leading to logarithmic time complexity.",
            difficulty: "HARD",
            topic: "Data Structures"
        },
        {
            question: "Which cloud computing model provides virtualized computing resources over the internet?",
            options: [
                "SaaS",
                "PaaS",
                "IaaS",
                "XaaS"
            ],
            correctAnswer: "IaaS",
            explanation: "Infrastructure as a Service (IaaS) provides fundamental computing resources like virtual machines, storage, and networks.",
            difficulty: "MEDIUM",
            topic: "Cloud Computing"
        },
        {
            question: "What does the 'A' in SOLID principles of object-oriented design stand for?",
            options: [
                "Abstraction",
                "Atomicity",
                "None - 'A' is not part of SOLID",
                "Asynchronous"
            ],
            correctAnswer: "None - 'A' is not part of SOLID",
            explanation: "SOLID stands for Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. There is no 'A'.",
            difficulty: "MEDIUM",
            topic: "Design Patterns"
        },
        {
            question: "Which of these is a key difference between SQL and NoSQL databases?",
            options: [
                "SQL databases are always faster",
                "NoSQL databases are always relational",
                "SQL databases typically use fixed schemas, while NoSQL can be schema-less",
                "NoSQL databases do not support ACID properties"
            ],
            correctAnswer: "SQL databases typically use fixed schemas, while NoSQL can be schema-less",
            explanation: "Relational (SQL) databases use rigid tables and schemas, whereas NoSQL (like MongoDB) allows for more flexible, document-based data structures.",
            difficulty: "MEDIUM",
            topic: "Databases"
        }
    ];
    async getMockMCQs(count) {
        // Shuffle and return requested count
        const shuffled = [...this.mockPool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}
exports.MockService = MockService;
exports.mockService = new MockService();
//# sourceMappingURL=mock.service.js.map