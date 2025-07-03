import React from 'react';
import { InputForm } from './investment/InputForm';
import { ProjectionResults } from './investment/ProjectionResults';

export const InvestmentCalculator: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Investment Portfolio Projection
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Plan your financial future with our advanced investment calculator. 
          Visualize growth, account for inflation, and make informed decisions.
        </p>
      </div>
      <InputForm />
      <ProjectionResults />
    </div>
  );
};