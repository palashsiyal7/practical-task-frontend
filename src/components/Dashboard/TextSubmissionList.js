import React from 'react';

const TextSubmissionList = ({ submissions }) => {
  return (
    <div>
      <h2>Text Submissions</h2>
      <ul>
        {submissions.map((submission) => (
          <li key={submission.id}>
            <p>{submission.text}</p>
            <p>Submitted on: {new Date(submission.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TextSubmissionList;
