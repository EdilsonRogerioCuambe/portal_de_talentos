import React from 'react'
import { FieldArray, Field, useFormikContext } from 'formik'
import { Education } from '../types/candidate'

interface FormValues {
  educations: Education[]
}

export const EducationFields: React.FC = () => {
  const { values, errors } = useFormikContext<FormValues>()

  return (
    <FieldArray name="educations">
      {({ push, remove }) => (
        <div className="space-y-4">
          {values.educations && values.educations.length > 0 ? (
            values.educations.map((education, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 relative">
                {(values.educations.length > 1 || 
                  (education.courseName || education.institution || education.concludedAt)) && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                    title="Remover formação"
                  >
                    ×
                  </button>
                )}

                <h4 className="font-medium text-gray-800 mb-3">
                  Formação {index + 1}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do curso *
                    </label>
                    <Field
                      name={`educations.${index}.courseName`}
                      placeholder="Ex: Ciência da Computação"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instituição *
                    </label>
                    <Field
                      name={`educations.${index}.institution`}
                      placeholder="Ex: Universidade Federal"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de conclusão *
                    </label>
                    <Field
                      name={`educations.${index}.concludedAt`}
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="mb-2">Nenhuma formação adicionada ainda</p>
              <p className="text-sm">Clique no botão abaixo para adicionar sua primeira formação</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => push({ courseName: '', institution: '', concludedAt: '' })}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            Adicionar Formação
          </button>

          {typeof errors.educations === 'string' && (
            <div className="text-red-500 text-sm mt-2">
              {errors.educations}
            </div>
          )}

          <div className="text-xs text-gray-500 mt-2">
            <p>* A formação acadêmica é opcional. Se você adicionar uma formação, todos os campos se tornam obrigatórios.</p>
          </div>
        </div>
      )}
    </FieldArray>
  )
}