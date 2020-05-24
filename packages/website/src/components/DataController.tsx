import React from 'react';

interface DataAndSetData {
  data: any;
  setData: (value: any) => void;
}
interface DataControllerProps extends DataAndSetData {
  className?: string;
  config: DataControllerConfig;
}
const DataController: React.FC<DataControllerProps> = ({ className, config, data, setData }) => {
  const fields = Object.keys(config);
  return (
    <>
      <table className={className}>
        <tbody>
          {fields.map(field => {
            const rowConfig = config[field];
            const Row = rowComponents[rowConfig.type];
            return <Row key={field} field={field} data={data} setData={setData} {...rowConfig} />;
          })}
        </tbody>
      </table>
      <style jsx>
        {`
          table {
            position: absolute;
            user-select: none;
          }
        `}
      </style>
    </>
  );
};

export default DataController;

interface RowProps {
  label: string;
}
const Row: React.FC<RowProps> = ({ label, children }) => {
  return (
    <>
      <tr>
        <th>
          <label>{label}</label>
        </th>
        <td>{children}</td>
      </tr>
      <style jsx>
        {`
          th {
            text-align: left;
          }
        `}
      </style>
    </>
  );
};

interface RangeProps extends RowProps, DataAndSetData {
  field: string;
  min: number;
  max: number;
  step: number;
}
const Range: React.FC<RangeProps> = ({ label, field, data, setData, min, max, step }) => {
  return (
    <Row label={label}>
      <input
        type="range"
        value={data[field]}
        onChange={e => {
          const value = +e.target.value;
          setData((data: any) => ({ ...data, [field]: value }));
        }}
        min={min}
        max={max}
        step={step}
      />
      &nbsp;
      {data[field]}
    </Row>
  );
};

type RowType = keyof typeof rowComponents;
type ReactProps<T extends React.FC<any>> = T extends React.FC<infer Props> ? Props : never;
type DataControllerConfig = {
  [field: string]: {
    [key in RowType]: { type: key } & Omit<
      ReactProps<typeof rowComponents[RowType]>,
      keyof DataAndSetData | 'field'
    >;
  }[RowType];
};
const rowComponents = {
  range: Range,
} as const;
