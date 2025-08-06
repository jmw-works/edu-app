// src/components/QuestionComponent.tsx
import { useState } from 'react';
import { View, Text, Button, Card, useTheme } from '@aws-amplify/ui-react';
import type { Question, HandleAnswer } from '../types/QuestionTypes';

interface Props {
  question: Question;
  onSubmit: HandleAnswer;
  isAnswered: boolean;
}

export function QuestionComponent({ question, onSubmit, isAnswered }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { tokens } = useTheme();

  const handleSelection = (answerId: string) => {
    if (!submitted) {
      setSelectedId(answerId);
    }
  };

  const handleSubmit = () => {
    if (submitted || selectedId === null) return;

    const answer = question.answers.find((a) => a.id === selectedId);
    if (!answer) return;

    onSubmit({
      questionId: question.id,
      isCorrect: answer.isCorrect,
      xp: question.xpValue ?? 0,
    });

    setSubmitted(true);
  };

  return (
    <Card
      variation="outlined"
      marginBottom="medium"
      padding="large"
      borderRadius="medium"
      boxShadow="small"
    >
      <Text fontSize="1.1rem" fontWeight="bold" marginBottom="small">
        {question.text}
      </Text>

      <View as="ul" marginBlock="medium" padding="0" style={{ listStyle: 'none' }}>
        {question.answers.map((ans) => {
          const isSelected = selectedId === ans.id;
          const isCorrect = submitted && ans.isCorrect;
          const isWrong = submitted && isSelected && !ans.isCorrect;

          return (
            <li key={ans.id}>
              <Button
  variation="primary" // valid for all versions
  size="small"
  onClick={() => handleSelection(ans.id)}
  disabled={submitted}
  style={{
    marginBottom: tokens.space.xs.value,
    width: '100%',
    backgroundColor:
      isCorrect ? '#16a34a' : isWrong ? '#dc2626' : isSelected ? tokens.colors.blue[60].value : undefined,
  }}
>
  {ans.content}
</Button>

            </li>
          );
        })}
      </View>

      {!submitted && (
        <Button
          variation="primary"
          size="small"
          onClick={handleSubmit}
          disabled={selectedId === null}
        >
          Submit
        </Button>
      )}

      {submitted && (
        <Text
          marginTop="small"
          color="font.secondary"
          fontSize="0.9rem"
          fontStyle="italic"
        >
          {question.answers.find((a) => a.isCorrect)?.content ?? 'Correct answer shown here.'}
        </Text>
      )}
    </Card>
  );
}

export default QuestionComponent;






























