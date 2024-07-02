interface IEnvironment {
  readonly pgHost: string;
  readonly pgPort: number;
  readonly pgUser: string;
  readonly pgPassword: string;
  readonly pgDatabase: string;

  readonly port: number;
}

export default IEnvironment;
