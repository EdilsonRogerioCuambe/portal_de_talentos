import React from 'react'
import Select from 'react-select'
import { FieldProps } from 'formik'
import { SkillOption } from '../types/candidate'

interface Props extends FieldProps {
  options: SkillOption[]
}

export const SkillsSelect: React.FC<Props> = ({ field, form, options }) => {
  const selected = options.filter(opt => field.value.includes(opt.id))

  return (
    <Select
      isMulti
      options={options}
      value={selected}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => (option && option.id ? option.id.toString() : '')}
      onChange={opts => {
        const vals = opts ? (opts as SkillOption[]).map(o => o.id) : []
        form.setFieldValue(field.name, vals)
      }}
      placeholder="Selecione as habilidades..."
      noOptionsMessage={() => "Nenhuma opção encontrada"}
    />
  )
}