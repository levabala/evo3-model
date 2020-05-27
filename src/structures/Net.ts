import { log, shell } from '../utility';

export interface Neuron {
  weightsInput: number[];
  weightsOutput: number[];
  activationFunc: (val: number) => number;
}

export class Net {
  hiddenNeurons: Neuron[];
  countInputs: number;
  countOutputs: number;
  countHidden: number;

  constructor(
    countInputs: number,
    countHidden: number,
    countOutputs: number,
    mutateRate: number = 0,
    hiddenNeurons?: Neuron[]
  ) {
    this.countInputs = countInputs;
    this.countOutputs = countOutputs;
    this.countHidden = countHidden;

    this.hiddenNeurons =
      hiddenNeurons?.map((neuron) => ({
        activationFunc: neuron.activationFunc,
        weightsInput: neuron.weightsInput.map(
          (weight) => (Math.random() - 0.5) * 2 * mutateRate + weight
        ),
        weightsOutput: neuron.weightsOutput.map(
          (weight) => (Math.random() - 0.5) * 2 * mutateRate + weight
        ),
      })) ||
      shell(countHidden).map(() => ({
        weightsInput: shell(countInputs).map(() => (Math.random() - 0.5) / 5),
        weightsOutput: shell(countOutputs).map(() => (Math.random() - 0.5) / 5),
        activationFunc: Math.tanh,
      }));

    log(this.hiddenNeurons);
  }

  calc(inputs: number[]) {
    // log("calc");
    // log({ inputs });

    const accumulated = this.hiddenNeurons.map((neuron) =>
      inputs.reduce((acc, input, i) => acc + neuron.weightsInput[i] * input, 0)
    );
    // log({ accumulated });

    const activated = this.hiddenNeurons.map((neuron, i) =>
      neuron.activationFunc(accumulated[i])
    );
    // log({ activated });

    const outputs = shell(this.countOutputs).map((_, indexOut) =>
      this.hiddenNeurons.reduce(
        (acc, neuron, indexNeuron) =>
          acc + activated[indexNeuron] * neuron.weightsOutput[indexOut],
        0
      )
    );
    // log({ outputs });

    return outputs;
  }

  serialize() {
    return JSON.stringify(this);
  }

  static deserialize(str: string) {
    const {
      hiddenNeurons: hiddenNeuronsPartial,
      countInputs,
      countOutputs,
      countHidden,
    } = JSON.parse(str);
    const hiddenNeurons = hiddenNeuronsPartial.map(
      (neuronPartial: Omit<Neuron, "activationFunc">) =>
        ({ ...neuronPartial, activationFunc: Math.tanh } as Neuron)
    );

    return new Net(countInputs, countHidden, countOutputs, 0, hiddenNeurons);
  }
}
