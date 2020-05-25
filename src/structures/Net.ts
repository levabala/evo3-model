import { shell } from '../utility';

export interface Neuron {
  weightsInput: number[];
  weightsOutput: number[];
  activationFunc: (val: number) => number;
}

export class Net {
  hiddenNeurons: Neuron[];
  countInputs: number;
  countOutputs: number;

  constructor(countInputs: number, countOutputs: number, countHidden: number) {
    this.countInputs = countInputs;
    this.countOutputs = countOutputs;

    this.hiddenNeurons = shell(countHidden).map(() => ({
      weightsInput: shell(countInputs).map(() => 0.1),
      weightsOutput: shell(countInputs).map(() => 0.1),
      activationFunc: Math.tanh,
    }));
  }

  calc(inputs: number[]) {
    const accumulated = this.hiddenNeurons.map((neuron) =>
      inputs.reduce((acc, input, i) => acc + neuron.weightsInput[i] * input, 0)
    );
    const activated = this.hiddenNeurons.map((neuron, i) =>
      neuron.activationFunc(accumulated[i])
    );
    const outputs = shell(this.countOutputs).map((_, indexOut) =>
      this.hiddenNeurons.reduce(
        (acc, neuron, indexNeuron) =>
          acc + activated[indexNeuron] * neuron.weightsOutput[indexOut],
        0
      )
    );

    return outputs;
  }
}
