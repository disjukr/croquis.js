import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';

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
            return (
              <Row
                key={field}
                field={field}
                data={data}
                setData={setData}
                {...(rowConfig as any)}
              />
            );
          })}
        </tbody>
      </table>
      <style jsx>
        {`
          table {
            position: absolute;
            font-family: sans-serif;
            font-variant-numeric: tabular-nums;
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

interface ColorProps extends RowProps, DataAndSetData {
  field: string;
}
const Color: React.FC<ColorProps> = ({ label, field, data, setData }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (show) {
      const onpointerdown = () => setShow(false);
      window.addEventListener('pointerdown', onpointerdown);
      return () => window.removeEventListener('pointerdown', onpointerdown);
    }
  }, [show]);
  return (
    <Row label={label}>
      <button onClick={() => setShow(!show)} />
      {show && (
        <div className="picker" onPointerDown={e => e.stopPropagation()}>
          <SketchPicker
            disableAlpha
            color={data[field]}
            onChange={color => {
              setData({ ...data, [field]: color.hex });
            }}
          />
        </div>
      )}
      <style jsx>{`
        button {
          background-color: ${data[field]};
        }
      `}</style>
      <style jsx>{`
        button {
          width: 3em;
          height: 1.5em;
        }
        .picker {
          margin-top: 0.5em;
          position: absolute;
        }
      `}</style>
    </Row>
  );
};

type RowType = keyof typeof rowComponents;
type ReactProps<T extends React.FC<any>> = T extends React.FC<infer Props> ? Props : never;
type DataControllerConfig = {
  [field: string]: {
    [key in RowType]: { type: key } & Omit<
      ReactProps<typeof rowComponents[key]>,
      keyof DataAndSetData | 'field'
    >;
  }[RowType];
};
const rowComponents = {
  range: Range,
  color: Color,
} as const;
