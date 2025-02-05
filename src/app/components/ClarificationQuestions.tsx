interface ClarificationQuestionsProps {
  questions: string[];
  onAnswer: (answer: string) => void;
}

export default function ClarificationQuestions({
  questions,
  onAnswer,
}: ClarificationQuestionsProps) {
  return (
    <div className="w-full max-w-2xl mt-4 p-4 bg-yellow-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">I need some clarification:</h3>
      <ul className="space-y-4">
        {questions.map((question, index) => (
          <li key={index} className="flex flex-col space-y-2">
            <p className="text-gray-700">{question}</p>
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your answer"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onAnswer((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  onAnswer(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Answer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 