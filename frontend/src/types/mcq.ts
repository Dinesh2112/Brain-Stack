export interface MCQ {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    topic: string;
    userAnswer?: string;
    isCorrect?: boolean;
}

export type GeneratorMode = "TOPIC" | "URL" | "FILE";

export interface TestState {
    mcqs: MCQ[];
    currentIndex: number;
    score: number;
    isFinished: boolean;
    startTime: number;
    endTime?: number;
}
