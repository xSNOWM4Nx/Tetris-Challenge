using TetrisChallenge.Domain.Constants;

namespace TetrisChallenge.Domain.ValueObjects
{
    public class KeyValue : ValueObject<KeyValue>
    {
        #region ctor

        public KeyValue() { }

        public KeyValue(string key)
        {
            var splittedKey = key.Split(".");

            Path = string.Join(Seperator, splittedKey, 0, splittedKey.Length - 1);
            Name = splittedKey[splittedKey.Length - 1];
        }

        public KeyValue(string path, string name)
        {
            Path = path;
            Name = name;
        }

        #endregion
        #region props

        public string Key
        {
            get
            {
                if (string.IsNullOrEmpty(Name))
                    return Path;

                if (string.IsNullOrEmpty(Path))
                    return Name;

                return Path + Seperator + Name;
            }
        }
        public string Path { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Seperator { get; set; } = StringConstants.Separator;

        #endregion

        #region ValueObject

        protected override bool EqualsCore(KeyValue other)
        {
            if (other == null)
                return false;

            return GetHashCode() == other.GetHashCode();
        }

        protected override int GetHashCodeCore()
        {
            return Key.GetHashCode();
        }

        #endregion
    }
}
