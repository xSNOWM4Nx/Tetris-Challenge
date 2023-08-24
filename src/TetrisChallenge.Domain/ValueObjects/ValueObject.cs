namespace TetrisChallenge.Domain.ValueObjects
{
    public abstract class ValueObject<T> where T : ValueObject<T>
    {
        #region ctor

        protected ValueObject() { }

        #endregion
        #region methods

        public override bool Equals(object obj)
        {
            var valueObject = obj as T;
            return EqualsCore(valueObject);
        }

        protected abstract bool EqualsCore(T other);

        public override int GetHashCode()
        {
            return GetHashCodeCore();
        }

        protected abstract int GetHashCodeCore();

        #endregion
        #region behaviours

        public static bool operator ==(ValueObject<T> a, ValueObject<T> b)
        {
            if (a is null && b is null)
                return true;

            if (a is null || b is null)
                return false;

            return a.Equals(b);
        }

        public static bool operator !=(ValueObject<T> a, ValueObject<T> b)
        {
            return !(a == b);
        }

        #endregion
    }
}
