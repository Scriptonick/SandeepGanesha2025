namespace GanpatiFestivalGame.Models.ViewModels
{
    public class ScratchResultViewModel
    {
        public bool Success { get; set; }
        public bool Won { get; set; }
        public string Message { get; set; }
        public GanpatiAvatarDto Avatar { get; set; }
    }

    public class GanpatiAvatarDto
    {
        public string Name { get; set; }
        public string Location { get; set; }
        public string ImageUrl { get; set; }
        public string Description { get; set; }
    }
}