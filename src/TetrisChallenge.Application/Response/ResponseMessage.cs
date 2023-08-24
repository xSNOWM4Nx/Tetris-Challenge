using TetrisChallenge.Domain.ValueObjects;

namespace TetrisChallenge.Application.Response
{
    public class ResponseMessage
    {
        #region ctor

        public ResponseMessage() { }

        #endregion
        #region props

        public LocalizableValue Display { get; set; } = new LocalizableValue();
        public string Context { get; set; } = string.Empty;
        public string LogText { get; set; } = string.Empty;
        public int LineNumber { get; set; } = -1;
        public string Caller { get; set; } = string.Empty;

        #endregion
    }
}
